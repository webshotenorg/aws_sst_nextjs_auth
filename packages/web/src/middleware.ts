import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isPublicPath = ["/login", "/"].includes(path);

    // クッキーからアクセストークンをチェック
    const accessToken = request.cookies.get("accessToken")?.value;

    if (!accessToken && !isPublicPath) {
        return NextResponse.redirect(new URL("/login", request.nextUrl));
    }

    if (accessToken && isPublicPath) {
        return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
};
