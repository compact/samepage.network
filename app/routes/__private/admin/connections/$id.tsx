export { default as CatchBoundary } from "@dvargas92495/app/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "@dvargas92495/app/components/DefaultErrorBoundary";
import remixAppAction from "@dvargas92495/app/backend/remixAppAction.server";
import Button from "@dvargas92495/app/components/Button";
import { ActionFunction, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import deleteOnlineClient from "~/data/deleteOnlineClient.server";

const SingleConnectionPage = () => {
  return (
    <div className={"flex gap-4"}>
      <Form method={"delete"}>
        <Button>Delete</Button>
      </Form>
    </div>
  );
};

export const action: ActionFunction = (args) => {
  // TODO replace with remixAdminAction
  return remixAppAction(args, {
    DELETE: ({ params }) =>
      deleteOnlineClient({
        id: params["id"] || "",
        requestId: args.context.lambdaContext.awsRequestId,
      }).then(() => redirect("/admin/connections")),
  });
};

export default SingleConnectionPage;
