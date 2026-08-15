import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/users/[id]/pay-rate-history — past effective-dated wage changes for one worker,
// newest first. Used by the admin edit-user UI to show a small collapsed history line when a
// row enters edit mode (fetched lazily, not part of the main /api/users list payload).
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;

        const history = await prisma.payRateHistory.findMany({
            where: { workerId: id },
            orderBy: { effectiveFrom: "desc" },
            select: { id: true, hourlyWage: true, effectiveFrom: true, createdAt: true, changedBy: { select: { name: true } } }
        });

        return NextResponse.json({ history });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
