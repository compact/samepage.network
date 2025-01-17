import randomString from "./randomString.server";
import { v4 } from "uuid";
import getMysql from "fuegojs/utils/mysql";
import getOrGenerateNotebookUuid from "./getOrGenerateNotebookUuid.server";
import { Notebook } from "package/internal/types";

const createNotebook = async ({
  requestId,
  app,
  workspace,
}: { requestId: string } & Notebook) => {
  const token = await randomString({ length: 12, encoding: "base64" });
  const tokenUuid = v4();
  const cxn = await getMysql(requestId);
  await cxn.execute(
    `INSERT INTO tokens (uuid, value)
      VALUES (?, ?)`,
    [tokenUuid, token]
  );
  const notebookUuid = await getOrGenerateNotebookUuid({
    requestId,
    app,
    workspace,
  });
  await cxn.execute(
    `INSERT INTO token_notebook_links (uuid, token_uuid, notebook_uuid)
        VALUES (UUID(), ?, ?)`,
    [tokenUuid, notebookUuid]
  );
  return { notebookUuid, token, tokenUuid };
};

export default createNotebook;
