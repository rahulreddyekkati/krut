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

        // Return AVAILABLE assignments in the worker's market (exclude their own releases).
        // requestedWorkerId gates visibility for admin-targeted invites (Job Scheduling
        // "By Date" bulk/per-row Request): null means open to the whole market as before,
        // set means only that specific worker should see it.
        //
        // Both conditions below are wrapped in explicit `{ field: null } OR { field: { not: x } }`
        // rather than a bare `{ not: x }` -- on a nullable column, SQL's three-valued logic means
        // `NULL != x` evaluates to NULL (not true), so a bare `{ not: x }` silently EXCLUDES
        // NULL rows too. releasedByWorkerId is null on admin-created invites (nobody released
        // them), so a bare `{ not: session.user.id }` would hide a worker's own invite from
        // themselves -- confirmed this exact failure mode while testing this feature.
        const available = await prisma.jobAssignment.findMany({
            where: {
                status: "AVAILABLE",
                job: { marketId: user.marketId },
                AND: [
                    { OR: [{ releasedByWorkerId: null }, { releasedByWorkerId: { not: session.user.id } }] },
                    { OR: [{ requestedWorkerId: null }, { requestedWorkerId: session.user.id }] }
                ]
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
