import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AppError } from "@/lib/apiError";

// ─── Startup guard ────────────────────────────────────────────────────────────
// Throw at module load time if JWT_SECRET is missing — fail fast, fail loud.
if (!process.env.JWT_SECRET) {
    throw new Error(
        "FATAL: JWT_SECRET environment variable is not set. " +
        "Set it in .env before starting the server."
    );
}

const key = new TextEncoder().encode(process.env.JWT_SECRET);

// ─── Core JWT helpers ─────────────────────────────────────────────────────────

export async function encrypt(payload: any): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ["HS256"],
    });
    return payload;
}

// ─── Session helpers (used by middleware) ─────────────────────────────────────

export async function getSession() {
    const cookiesList = await cookies();
    const headersList = await headers();

    let session = cookiesList.get("session")?.value;

    if (!session) {
        const authHeader = headersList.get("Authorization");
        if (authHeader?.startsWith("Bearer ")) {
            session = authHeader.substring(7);
        }
    }

    if (!session) return null;
    try {
        return await decrypt(session);
    } catch {
        return null;
    }
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get("session")?.value;
    if (!session) return;

    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const res = NextResponse.next();
    res.cookies.set({
        name: "session",
        value: await encrypt(parsed),
        httpOnly: true,
        expires: parsed.expires,
    });
    return res;
}

// ─── requireAuth — the new standard for every protected route ─────────────────

export type AuthorizedUser = {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    marketId: string | null;
    managedMarketId: string | null;
    hourlyWage: number | null;
};

/**
 * requireAuth(request, allowedRoles?)
 *
 * 1. Verifies JWT signature using process.env.JWT_SECRET
 * 2. Re-fetches user from DB on EVERY request (closes CRIT-02 gap)
 * 3. Blocks SUSPENDED and DEACTIVATED users immediately
 * 4. If allowedRoles provided, returns 403 if user's DB role doesn't match
 *
 * Throws AppError on any failure — handleApiError() converts to the right HTTP response.
 */
export async function requireAuth(
    request: NextRequest,
    allowedRoles?: string[]
): Promise<AuthorizedUser> {
    // 1. Extract token
    let token: string | undefined;

    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
    } else {
        token = request.cookies.get("session")?.value;
    }

    if (!token) {
        throw new AppError("Unauthorized", 401);
    }

    // 2. Verify JWT signature
    let jwtPayload: any;
    try {
        jwtPayload = await decrypt(token);
    } catch {
        throw new AppError("Unauthorized — invalid or expired token", 401);
    }

    const userId: string = jwtPayload?.user?.id;
    if (!userId) {
        throw new AppError("Unauthorized — malformed token", 401);
    }

    // 3. Re-fetch user from DB (CRIT-02 fix — role/status always from DB, never JWT)
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            marketId: true,
            managedMarketId: true,
            hourlyWage: true,
        },
    });

    if (!user) {
        throw new AppError("Unauthorized — user not found", 401);
    }

    // 4. Block inactive users
    if (user.status === "SUSPENDED" || user.status === "DEACTIVATED") {
        throw new AppError("Account is inactive", 403);
    }

    // 5. Role check
    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
            throw new AppError("Forbidden — insufficient permissions", 403);
        }
    }

    return user;
}
