import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/users/workers - List all users with role WORKER
export async function GET() {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKET_MANAGER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const workers = await prisma.user.findMany({
            where: { role: "WORKER" },
            select: { id: true, name: true, email: true },
            orderBy: { name: "asc" }
        });

        return NextResponse.json(workers);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
