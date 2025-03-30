/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    CognitoIdentityProviderClient,
    GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const accessToken = request.cookies.get("accessToken")?.value;

    if (!accessToken) {
        return NextResponse.json(
            { valid: false, error: "No access token provided" },
            { status: 401 },
        );
    }

    try {
        const client = new CognitoIdentityProviderClient({
            region: process.env.NEXT_PUBLIC_COGNITO_REGION,
        });

        await client.send(
            new GetUserCommand({
                AccessToken: accessToken,
            }),
        );

        return NextResponse.json({ valid: true });
    } catch (error: any) {
        console.error("Token validation failed:", error);
        return NextResponse.json(
            {
                valid: false,
                error: error.message,
                name: error.name, // NotAuthorizedExceptionなど
            },
            { status: 401 },
        );
    }
}
