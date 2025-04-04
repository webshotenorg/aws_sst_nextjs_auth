import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isPublicPath = ["/login", "/"].includes(path);

    // クッキーからアクセストークンをチェック
    const accessToken = request.cookies.get("accessToken")?.value;

    if (!accessToken && !isPublicPath) {
        const encoded = encodeURIComponent(path);
        return NextResponse.redirect(
            // returnToで認証後遷移できるように保持する
            new URL(`/login?returnTo=${encoded}`, request.nextUrl),
        );
    }

    if (accessToken && isPublicPath) {
        return NextResponse.redirect(new URL(path, request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/about", "/login"],
};
