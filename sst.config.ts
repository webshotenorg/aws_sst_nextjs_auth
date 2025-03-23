/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "nextjsapp",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const table = new sst.aws.Dynamo("MyTable", {
      fields: {
        userId: "string",
        noteId: "string",
      },
      primaryIndex: { hashKey: "userId", rangeKey: "noteId" },
    });

    const func = new sst.aws.Function("MyFunction", {
      url: false,
      handler: "packages/functions/src/api.handler",
      permissions: [
        {
          actions: ["dynamodb:Query"],
          resources: [table.arn],
        },
      ],
      link: [table],
    });

    const api = new sst.aws.ApiGatewayV2("MyApi", {
      cors: {
        allowMethods: ["GET"],
        allowOrigins: ["*"],
      },
    });

    api.route("GET /", func.arn);

    new sst.aws.Nextjs("MyWeb", {
      path: "packages/web",
      link: [api],
      environment: {
        NEXT_PUBLIC_API_URL: api.url,
      },
    });

    return {
      MyApi: api,
      MyTable: table,
    };
  },
});
