import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { encrypt } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";
import { validate, loginSchema } from "@/lib/validate";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = validate(loginSchema, body);

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        if (user.status === "SUSPENDED" || user.status === "DEACTIVATED") {
            return NextResponse.json({ error: "Account is inactive" }, { status: 403 });
        }

        // Mobile clients get a long-lived token (180 days) so they stay logged in.
        // Web browser sessions get the standard 24h rolling cookie.
        const isMobileApp = request.headers.get("x-app-client") === "mobile-app";
        const tokenLifetime = isMobileApp ? "180d" : "24h";
        const cookieMaxAge = isMobileApp
            ? 180 * 24 * 60 * 60 * 1000  // 180 days in ms
            : 24 * 60 * 60 * 1000;       // 24 hours in ms

        const expires = new Date(Date.now() + cookieMaxAge);
        const session = await encrypt(
            {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                expires
            },
            tokenLifetime
        );

        const response = NextResponse.json({ success: true, token: session });

        // Only set cookies for web sessions (mobile uses the token directly)
        if (!isMobileApp) {
            response.cookies.set({
                name: "session",
                value: session,
                httpOnly: true,
                expires: expires,
            });
        }

        return response;
    } catch (error) {
        return handleApiError(error);
    }
}
