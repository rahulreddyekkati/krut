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

        // Create session
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const session = await encrypt({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            expires
        });

        const response = NextResponse.json({ success: true, token: session });
        response.cookies.set({
            name: "session",
            value: session,
            httpOnly: true,
            expires: expires,
        });

        return response;
    } catch (error) {
        return handleApiError(error);
    }
}
