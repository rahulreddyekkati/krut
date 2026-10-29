import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/health — App Runner's health check. Runs a trivial query through the shared
// Prisma client so a hung database connection fails the check and App Runner replaces the
// instance. (Checking a static page like /login kept reporting healthy while every request
// that touched the database hung.)
export const dynamic = "force-dynamic";

const DB_TIMEOUT_MS = 3000; // under App Runner's 5s health-check timeout

export async function GET() {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
        await Promise.race([
            prisma.$queryRaw`SELECT 1`,
            new Promise((_, reject) => {
                timer = setTimeout(() => reject(new Error(`DB ping timed out after ${DB_TIMEOUT_MS}ms`)), DB_TIMEOUT_MS);
            }),
        ]);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("[HEALTH] database check failed:", error);
        return NextResponse.json({ ok: false }, { status: 503 });
    } finally {
        clearTimeout(timer);
    }
}
