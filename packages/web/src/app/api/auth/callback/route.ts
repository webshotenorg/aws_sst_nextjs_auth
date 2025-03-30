import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        return NextResponse.redirect(
            new URL(`/login?error=${error}`, request.nextUrl.origin),
        );
    }

    if (!code) {
        return NextResponse.redirect(
            new URL("/login?error=missing_code", request.nextUrl.origin),
        );
    }

    try {
        const tokenEndpoint =
            `https://${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/token`;

        const body = new URLSearchParams();
        body.append("grant_type", "authorization_code");
        body.append("client_id", process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!);
        body.append("code", code);
        body.append(
            "redirect_uri",
            process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI!,
        );

        const authHeader = Buffer.from(
            `${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}:${process.env.COGNITO_CLIENT_SECRET}`,
        ).toString("base64");

        const authString =
            `${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}:${process.env.COGNITO_CLIENT_SECRET}`;
        console.log("Auth String:", authString);
        console.log(
            "Base64 Header:",
            Buffer.from(authString).toString("base64"),
        );

        const response = await fetch(tokenEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${authHeader}`,
            },
            body: body.toString(),
        });

        if (!response.ok) {
            const errorResponse = await response.text(); // または response.json() もしJSON形式なら
            console.error("Token request failed details:", errorResponse);
            throw new Error(
                `Token request failed: ${response.status} - ${errorResponse}`,
            );
        }

        const tokens = await response.json();

        // トークンを保存
        const res = NextResponse.redirect(
            new URL("/dashboard", request.nextUrl.origin),
        );

        console.log(tokens);
        res.cookies.set("idToken", tokens.id_token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            maxAge: tokens.expires_in,
            sameSite: "lax", // or "none" for cross-site
            path: "/",
        });

        res.cookies.set("accessToken", tokens.access_token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            maxAge: tokens.expires_in,
            sameSite: "lax", // or "none" for cross-site
            path: "/",
        });

        return res;
    } catch (err) {
        console.error("Authentication error:", err);
        return NextResponse.redirect(
            new URL("/login?error=auth_failed", request.nextUrl.origin),
        );
    }
}
