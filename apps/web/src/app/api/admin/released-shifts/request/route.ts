import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendPushToUser } from "@/lib/notifications";
import { sendShiftInterestRequestEmail } from "@/lib/mailer";
import { to12hr } from "@/lib/timeFormat";

// Skip re-notifying the same worker about the same shift within this window
// (guards against accidental double-clicks; not a strict/atomic lock).
const DEDUPE_WINDOW_MS = 5 * 60 * 1000;

// POST /api/admin/released-shifts/request - Ping a worker to ask if they're
// interested in picking up a released (AVAILABLE) shift. Purely informational:
// does not assign the shift or create any trackable response.
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || !["ADMIN", "MARKET_MANAGER"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { assignmentId, workerId } = body;

        if (!assignmentId || !workerId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const assignment = await prisma.jobAssignment.findUnique({
            where: { id: assignmentId },
            include: { job: { include: { store: { select: { name: true } } } } }
        });

        if (!assignment || assignment.status !== "AVAILABLE") {
            return NextResponse.json({ error: "Shift is no longer available" }, { status: 400 });
        }

        // Market Manager scoping: mirrors the GET /api/admin/released-shifts list,
        // which only shows shifts within the manager's own market.
        if (session.user.role === "MARKET_MANAGER") {
            const requester = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { managedMarketId: true }
            });
            if (!requester?.managedMarketId || requester.managedMarketId !== assignment.job.marketId) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        const worker = await prisma.user.findUnique({ where: { id: workerId } });
        if (!worker || worker.role !== "WORKER") {
            return NextResponse.json({ error: "Invalid worker selected" }, { status: 400 });
        }

        const dateLabel = assignment.date
            ? new Date(assignment.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })
            : "Recurring";
        const title = "Shift Available";
        const message = `Interested in picking up this shift at ${assignment.job.store.name} on ${dateLabel}, ${to12hr(assignment.job.startTimeStr)}–${to12hr(assignment.job.endTimeStr)}? Open the app to claim it.`;

        // Lightweight dedupe: skip re-sending if the same notification went to this
        // worker within the last few minutes (e.g. accidental double-click).
        const recent = await prisma.notification.findFirst({
            where: {
                userId: workerId,
                title,
                message,
                createdAt: { gte: new Date(Date.now() - DEDUPE_WINDOW_MS) }
            }
        });
        if (recent) {
            return NextResponse.json({ success: true, deduped: true });
        }

        await prisma.notification.create({ data: { userId: workerId, title, message } });

        sendPushToUser(workerId, title, message).catch((e) =>
            console.error("[released-shifts/request] push failed:", e)
        );
        if (worker.email) {
            sendShiftInterestRequestEmail(
                worker.email,
                assignment.job.store.name,
                dateLabel,
                assignment.job.startTimeStr,
                assignment.job.endTimeStr
            ).catch((e) => console.error("[released-shifts/request] email failed:", e));
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Request interest error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
