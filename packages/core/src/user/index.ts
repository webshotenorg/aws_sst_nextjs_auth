import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";

export interface UserType {
    userId: string;
    noteId: string;
}

export namespace User {
    export async function getUser(
        docClient: DynamoDBDocumentClient,
        params: { userId: string },
    ): Promise<UserType[]> {
        const res = await docClient.send(
            new QueryCommand({
                TableName: Resource.MyTable.name,
                KeyConditionExpression: "userId = :userId",
                ExpressionAttributeValues: {
                    ":userId": params.userId,
                },
            }),
        );
        return res.Items as UserType[];
    }
}
