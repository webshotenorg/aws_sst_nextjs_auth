import {
    CognitoIdentityProviderClient,
    GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextRequest, NextResponse } from "next/server";

interface UserAttributes {
    email?: string;
    email_verified?: string;
    sub?: string;
    [key: string]: string | undefined;
}

export async function GET(request: NextRequest) {
    const accessToken = request.cookies.get("accessToken")?.value;

    if (!accessToken) {
        return NextResponse.json(
            { error: "Access token missing" },
            { status: 401 },
        );
    }

    try {
        const client = new CognitoIdentityProviderClient({
            region: process.env.NEXT_PUBLIC_COGNITO_REGION,
        });

        const { Username, UserAttributes } = await client.send(
            new GetUserCommand({ AccessToken: accessToken }),
        );

        // 属性を型安全に変換
        const attributes = UserAttributes?.reduce<UserAttributes>(
            (acc, attr) => {
                if (attr.Name && attr.Value !== undefined) {
                    acc[attr.Name] = attr.Value;
                }
                return acc;
            },
            {},
        );

        return NextResponse.json({
            username: Username,
            email: attributes?.email,
            emailVerified: attributes?.email_verified === "true",
            userId: attributes?.sub,
            // その他の必要な属性
        });
    } catch (error) {
        console.error("Failed to fetch user:", error);
        return NextResponse.json(
            { error: "Failed to fetch user data" },
            { status: 500 },
        );
    }
}
