/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "sstauth",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const nextjsUrl = ["production", "develop"].includes($app.stage)
      ? process.env.BASE_URL
      : "http://localhost:3000";

    const userPool = new sst.aws.CognitoUserPool("MyUserPool", {
      transform: {
        userPool(args, opts, name) {
          args.autoVerifiedAttributes = ["email"];
          args.usernameAttributes = ["email"];
          args.usernameConfiguration = {
            caseSensitive: false, // メールの大文字小文字を区別しない
          };

          args.accountRecoverySetting = {
            recoveryMechanisms: [{ name: "verified_email", priority: 1 }],
          };

          args.emailConfiguration = {
            emailSendingAccount: "COGNITO_DEFAULT",
          };

          args.adminCreateUserConfig = {
            allowAdminCreateUserOnly: false, // ユーザー自身のサインアップを許可
          };
          args.passwordPolicy = {
            minimumLength: 8,
            requireLowercase: true,
            requireNumbers: true,
            requireUppercase: true,
            requireSymbols: false, // 記号は任意
            temporaryPasswordValidityDays: 7, // 仮パスワード有効期限
          };
        },
      },
    });

    const userPoolWeb = userPool.addClient("Web", {
      transform: {
        client(args, opts, name) {
          args.generateSecret = true;
          args.explicitAuthFlows = [
            "ALLOW_USER_PASSWORD_AUTH",
            "ALLOW_REFRESH_TOKEN_AUTH",
          ];
          args.supportedIdentityProviders = ["COGNITO"];
          args.callbackUrls = [`${nextjsUrl}/api/auth/callback`];
          args.logoutUrls = [`${nextjsUrl}/dashboard`];
          args.allowedOauthFlows = ["code"]; // 認証コードフローを有効化
          args.allowedOauthScopes = [
            "openid",
            "email",
            "profile",
            "aws.cognito.signin.user.admin",
          ];
          args.allowedOauthFlowsUserPoolClient = true; // ユーザープールクライアントでOAuthを許可
        },
      },
    });

    const userPoolDomain = new aws.cognito.UserPoolDomain("MyCognitoDomain", {
      userPoolId: userPool.id,
      domain: `${$app.name}-${$app.stage}`, // グローバルで一意なプレフィックス
    });

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

    const current = await aws.getRegion({});
    const region = current.name;

    const web = new sst.aws.Nextjs("MyWeb", {
      path: "packages/web",
      link: [api],
      environment: {
        NEXT_PUBLIC_API_URL: $interpolate`${api.url}`,
        NEXT_PUBLIC_COGNITO_REGION: $interpolate`${region}`,
        NEXT_PUBLIC_COGNITO_REDIRECT_URI:
          $interpolate`${nextjsUrl}/api/auth/callback`,
        NEXT_PUBLIC_COGNITO_USER_POOL_ID: $interpolate`${userPool.id}`,
        NEXT_PUBLIC_COGNITO_CLIENT_ID: $interpolate`${userPoolWeb.id}`,
        COGNITO_CLIENT_SECRET: $interpolate`${userPoolWeb.secret}`,
        NEXT_PUBLIC_COGNITO_DOMAIN:
          $interpolate`${$app.name}-${$app.stage}.auth.${region}.amazoncognito.com`,
      },
    });

    return {
      MyApi: api,
      MyTable: table,
      MyWeb: web,
    };
  },
});
