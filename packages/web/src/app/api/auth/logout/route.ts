import { NextResponse } from "next/server";

export function GET() {
    const response = NextResponse.redirect(
        `https://${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/logout?${new URLSearchParams(
            {
                client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
                redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI!,
                response_type: "code",
            },
        )}`,
    );

    // クッキー削除
    response.cookies.delete("idToken");
    response.cookies.delete("accessToken");

    return response;
}
