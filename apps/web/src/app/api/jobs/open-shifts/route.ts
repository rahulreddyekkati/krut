import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { marketId: true }
        });

        if (!user?.marketId) return NextResponse.json({ shifts: [] });

        // Return AVAILABLE assignments in the worker's market (exclude their own releases)
        const available = await prisma.jobAssignment.findMany({
            where: {
                status: "AVAILABLE",
                job: { marketId: user.marketId },
                releasedByWorkerId: { not: session.user.id }
            },
            include: {
                job: {
                    include: {
                        store: { select: { name: true, address: true } },
                        market: { select: { name: true } }
                    }
                }
            },
            orderBy: { date: "asc" }
        });

        // Flag which ones the worker already requested
        const pendingRequests = await prisma.shiftRequest.findMany({
            where: {
                workerId: session.user.id,
                status: "PENDING",
                assignmentId: { in: available.map(a => a.id) }
            },
            select: { assignmentId: true }
        });
        const requestedIds = new Set(pendingRequests.map(r => r.assignmentId));

        const shifts = available.map(a => ({
            ...a,
            alreadyRequested: requestedIds.has(a.id)
        }));

        return NextResponse.json({ shifts });
    } catch (error) {
        console.error("Open shifts error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
