import uploadFile from "@dvargas92495/app/backend/uploadFile.server";
import postError from "~/data/postError.server";
import { v4 } from "uuid";
import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import { downloadFileContent } from "@dvargas92495/app/backend/downloadFile.server";
import type { AppId } from "client/src/types";
import postToConnection from "~/data/postToConnection.server";
import messageNotebook from "~/data/messageNotebook.server";
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

// postToConnection({
//   ConnectionId,
//   Data: {
//     operation: "INITIALIZE_P2P",
//     to: event.requestContext.connectionId,
//     graph,
//   },
// })

export type WSEvent = Pick<APIGatewayProxyEvent, "body"> & {
  requestContext: Pick<APIGatewayProxyEvent["requestContext"], "connectionId">;
};

export type WSHandler = (
  event: WSEvent,
  context: Pick<Context, "awsRequestId">
) => Promise<APIGatewayProxyResult>;

const dataHandler = async (
  event: WSEvent,
  data: string,
  messageUuid: string,
  requestId: string
): Promise<void> => {
  const { operation, ...props } = JSON.parse(data);
  const clientId = event.requestContext?.connectionId || "";
  console.log("received operation", operation, "from client", clientId);
  if (operation === "AUTHENTICATION") {
    const { app, workspace } = props as { app: AppId; workspace: string };
    const cxn = await getMysqlConnection(requestId);
    const [_, messages] = await Promise.all([
      // one downside of inserting here instead of onconnect is the clock drift on created date
      // a client could theoretically connect without authenticate and would get free usage
      cxn.execute(
        `INSERT INTO online_clients (app, instance, id, created_date) 
        VALUES (?,?,?,?)`,
        [app, workspace, clientId, new Date()]
      ),
      cxn
        .execute(
          `SELECT uuid FROM messages WHERE marked = 0 AND target_app = ? AND target_instance = ?`,
          [app, workspace]
        )
        .then(([r]) => (r as { uuid: string }[]).map((s) => s.uuid)),
    ]);
    await postToConnection({
      ConnectionId: clientId,
      Data: {
        operation: "AUTHENTICATION",
        success: true,
        messages,
      },
    });
    cxn.destroy();
  } else if (operation === "OFFER") {
    const { to, offer } = props as { to: string; offer: string };
    return postToConnection({
      ConnectionId: to,
      Data: {
        operation: `OFFER`,
        to: clientId,
        offer,
      },
    });
  } else if (operation === "ANSWER") {
    const { to, answer } = props as { to: string; answer: string };
    return postToConnection({
      ConnectionId: to,
      Data: {
        operation: `ANSWER`,
        answer,
      },
    });
  } else if (operation === "PROXY") {
    const { proxyOperation, app, workspace, ...proxyData } = props as {
      proxyOperation: string;
      workspace: string;
      app: AppId;
    };
    const cxn = await getMysqlConnection(requestId);
    const [source] = await cxn
      .execute(`SELECT app, instance FROM online_clients WHERE id = ?`, [
        clientId,
      ])
      .then(([a]) => a as { app: AppId; instance: string }[])
      .catch((e) => {
        console.error("Failed to find online client", e.message);
        return [];
      });
    return (
      source
        ? messageNotebook({
            source: { app: source.app, workspace: source.instance },
            target: { app, workspace },
            data: {
              operation: proxyOperation,
              ...proxyData,
            },
            messageUuid,
            requestId,
          })
        : postError({
            event,
            Message: `Could not find online client with id: ${clientId}`,
          })
    ).finally(() => cxn.destroy());
  } else {
    return postError({
      event,
      Message: `Invalid server operation: ${operation}`,
    });
  }
};

export const wsHandler = async (
  event: WSEvent,
  requestId: string
): Promise<void> => {
  const chunkData = event.body ? JSON.parse(event.body).data : {};
  const { message, uuid: messageUuid, chunk, total } = chunkData;
  if (total === 1) return dataHandler(event, message, messageUuid, requestId);
  else {
    const uuid = v4();
    const cxn = await getMysqlConnection(requestId);
    await Promise.all([
      uploadFile({
        Body: message,
        Key: `data/ongoing/${messageUuid}/${uuid}`,
      }),
      cxn.execute(
        `INSERT INTO ongoing_messages (uuid, chunk, message_uuid) VALUES (?,?,?)`,
        [uuid, chunk, messageUuid]
      ),
    ]);

    const chunks = await cxn
      .execute(
        `SELECT uuid, chunk FROM ongoing_messages WHERE message_uuid = ?`,
        [messageUuid]
      )
      .then(([c]) => c as { uuid: string; chunk: number }[]);
    if (chunks.length === total) {
      return Promise.all(
        chunks.map((c) =>
          c.chunk === chunk
            ? { message, chunk }
            : downloadFileContent({
                Key: `data/ongoing/${messageUuid}/${c.uuid}`,
              })
                .then((message) => ({ message, chunk: c.chunk }))
                .catch((e) => {
                  return Promise.reject(
                    new Error(
                      `Failed to fetch chunk ${c} for ongoing message ${messageUuid}: ${e.message}`
                    )
                  );
                })
        )
      ).then((chunks) =>
        dataHandler(
          event,
          chunks
            .sort((a, b) => a.chunk - b.chunk)
            .map((a) => a.message)
            .join(""),
          uuid,
          requestId
        )
      );
    }
  }
};

export const handler: WSHandler = (event, context) =>
  wsHandler(event, context.awsRequestId)
    .then(() => ({ statusCode: 200, body: "Success" }))
    .catch((e) =>
      postError({
        event,
        Message: `Uncaught Server Error: ${e.message}`,
      }).then(() => {
        console.log("Uncaught WebSocket error: ", e);
        return {
          statusCode: 500,
          body: `Uncaught WebSocket Error: ${e.message}`,
        };
      })
    );
