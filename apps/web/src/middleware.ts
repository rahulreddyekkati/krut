import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login", "/api/auth/login", "/invite"];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isPublicRoute = publicRoutes.some(r => path.startsWith(r));

    // Check for session cookie presence — full JWT verification happens in API routes (Node.js).
    // Middleware runs in Edge Runtime which can't reliably access JWT_SECRET from .env.
    const session = request.cookies.get("session")?.value;

    if (!isPublicRoute && !session) {
        return NextResponse.redirect(new URL("/login", request.nextUrl));
    }

    if (isPublicRoute && session && path === "/login") {
        return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
