import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendPushToUser } from "@/lib/notifications";
import { to12hr } from "@/lib/timeFormat";

// Skip re-notifying the same worker about the same shift within this window
// (guards against accidental double-clicks / rapid re-request; not a strict/atomic lock).
// Mirrors apps/web/src/app/api/admin/released-shifts/request/route.ts.
const DEDUPE_WINDOW_MS = 5 * 60 * 1000;

interface RequestItem {
    jobId: string;
    date: string | null;
    assignmentId?: string | null;
}

interface ItemResult {
    jobId: string;
    date: string | null;
    success: boolean;
    reason?: string;
}

// POST /api/admin/jobs/by-date/request - Targeted bulk/per-row shift invite from the
// Job Scheduling "By Date" tab. Unlike /api/admin/released-shifts/request (a purely
// informational ping), this actually creates/updates an AVAILABLE JobAssignment with
// requestedWorkerId set, which GET /api/jobs/open-shifts uses to restrict visibility
// to just that worker. The worker still has to claim it (ACCEPT -> ShiftRequest) and
// an admin still approves it through the existing queue -- this endpoint only makes
// the shift visible to them and pings them about it.
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || !["ADMIN", "MARKET_MANAGER"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { items, workerId } = body as { items?: RequestItem[]; workerId?: string };

        if (!workerId || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Missing workerId or items" }, { status: 400 });
        }

        const worker = await prisma.user.findUnique({ where: { id: workerId } });
        if (!worker || worker.role !== "WORKER") {
            return NextResponse.json({ error: "Invalid worker selected" }, { status: 400 });
        }

        let managedMarketId: string | null = null;
        if (session.user.role === "MARKET_MANAGER") {
            const requester = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { managedMarketId: true }
            });
            managedMarketId = requester?.managedMarketId ?? null;
        }

        const results: ItemResult[] = [];

        for (const item of items) {
            const { jobId, date, assignmentId } = item;

            if (!jobId) {
                results.push({ jobId, date, success: false, reason: "Missing jobId" });
                continue;
            }

            // Recurring templates with no materialized date aren't a single requestable shift.
            if (!date) {
                results.push({ jobId, date, success: false, reason: "Cannot request a recurring template without a specific date" });
                continue;
            }

            const job = await prisma.job.findUnique({
                where: { id: jobId },
                include: { store: { select: { name: true } } }
            });
            if (!job) {
                results.push({ jobId, date, success: false, reason: "Job not found" });
                continue;
            }

            // Market Manager scoping: mirrors GET /api/admin/released-shifts and
            // POST /api/admin/released-shifts/request -- re-validated per item server-side,
            // never trusted from client-side filtering.
            if (session.user.role === "MARKET_MANAGER" && (!managedMarketId || job.marketId !== managedMarketId)) {
                results.push({ jobId, date, success: false, reason: "Forbidden — outside your market" });
                continue;
            }

            const targetDate = new Date(date);
            let outcome: "updated" | "created" | null = null;

            if (assignmentId) {
                const assignment = await prisma.jobAssignment.findUnique({ where: { id: assignmentId } });
                if (!assignment) {
                    results.push({ jobId, date, success: false, reason: "Assignment not found" });
                    continue;
                }
                if (assignment.status === "AVAILABLE") {
                    if (assignment.requestedWorkerId === workerId) {
                        results.push({ jobId, date, success: false, reason: "Already requested for this worker" });
                        continue;
                    }
                    await prisma.jobAssignment.update({
                        where: { id: assignmentId },
                        data: { requestedWorkerId: workerId }
                    });
                    outcome = "updated";
                }
                // If the assignment exists but isn't AVAILABLE (e.g. it's ASSIGNED to
                // someone else), fall through below to offer a second worker slot for
                // the same job+date instead.
            }

            if (!outcome) {
                const existing = await prisma.jobAssignment.findFirst({
                    where: { workerId, jobId, date: targetDate }
                });
                if (existing) {
                    results.push({ jobId, date, success: false, reason: "Worker already has an assignment for this job/date" });
                    continue;
                }
                await prisma.jobAssignment.create({
                    data: {
                        jobId,
                        workerId,
                        date: targetDate,
                        status: "AVAILABLE",
                        requestedWorkerId: workerId,
                        isRecurring: false
                    }
                });
                outcome = "created";
            }

            results.push({ jobId, date, success: true });

            // Fire-and-forget notification/push — message includes store/date/time so it
            // stays distinct per shift (see DEDUPE_WINDOW_MS below). Push + in-app
            // notification only, no email here (unlike the sibling released-shifts/request
            // ping) -- the app is the source of truth for claiming the shift either way.
            const dateLabel = new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
            const title = "Shift Available";
            const message = `Interested in picking up this shift at ${job.store.name} on ${dateLabel}, ${to12hr(job.startTimeStr)}–${to12hr(job.endTimeStr)}? Open the app to claim it.`;

            (async () => {
                const recent = await prisma.notification.findFirst({
                    where: {
                        userId: workerId,
                        title,
                        message,
                        createdAt: { gte: new Date(Date.now() - DEDUPE_WINDOW_MS) }
                    }
                });
                if (recent) return;

                await prisma.notification.create({ data: { userId: workerId, title, message } });
                sendPushToUser(workerId, title, message).catch(() => {});
            })().catch((e) => console.error("[by-date/request] notification failed:", e));
        }

        return NextResponse.json({ results });
    } catch (error: any) {
        console.error("By-date request error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
