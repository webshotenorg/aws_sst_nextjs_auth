import { Handler } from "aws-lambda";
import { Example } from "@sstauth/core/example";
import { User } from "../../core/src/user";
import { docClient } from "@sstauth/core/dynamodb";

export const handler: Handler = async (_event) => {
  console.log(_event);
  return {
    statusCode: 200,
    body: `${Example.hello()} : ${
      JSON.stringify(
        await User.getUser(docClient, {
          userId: "1",
        }),
      )
    }.`,
  };
};
