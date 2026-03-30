import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

const publicRoutes = ["/login", "/api/auth/login", "/invite"];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isPublicRoute = publicRoutes.includes(path);

    const session = request.cookies.get("session")?.value;
    let decoded = null;

    if (session) {
        try {
            decoded = await decrypt(session);
        } catch (error) {
            // Invalid session
        }
    }

    // Redirect to login if path is protected and no session
    if (!isPublicRoute && !decoded) {
        return NextResponse.redirect(new URL("/login", request.nextUrl));
    }

    // Redirect to dashboard if logged in and trying to access login
    if (isPublicRoute && decoded && path === "/login") {
        return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
