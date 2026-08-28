import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { localTimeToUTC, toUTCLocalDateStr } from "@/lib/timezone";

// POST /api/admin/assignments/[id]/clock-in
// Manual admin correction: records a clock-in for a worker who couldn't clock in via the
// app (app issue, forgot phone, etc). Mirrors what the real clock-in endpoint does —
// sets clockIn + status IN_PROGRESS — but lets the admin pick the time directly instead
// of using "now", and skips the geofence/early-window checks since an admin is vouching
// for it manually. See apps/web/src/app/api/jobs/[id]/clock-in/route.ts for the worker-facing
// version this is modeled on.
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);
        const { id: assignmentId } = await context.params;
        const { time, date } = await request.json();

        if (!time || !/^\d{2}:\d{2}$/.test(time)) {
            throw new AppError("A valid time (HH:MM) is required", 400);
        }

        const assignment = await prisma.jobAssignment.findUnique({
            where: { id: assignmentId },
            include: {
                job: { include: { store: { select: { timezone: true, marketId: true } } } }
            }
        });

        if (!assignment) {
            throw new AppError("Assignment not found", 404);
        }

        // Market Manager scope check
        if (user.role === "MARKET_MANAGER" && assignment.job.store.marketId !== user.managedMarketId) {
            throw new AppError("Unauthorized: Assignment outside your market", 403);
        }

        if (assignment.clockOut) {
            throw new AppError("This shift is already clocked out — edit the shift instead of manually clocking in", 400);
        }

        // Prefer the assignment's own dated occurrence; fall back to the date the admin had
        // selected on the dashboard (covers not-yet-materialized recurring template rows).
        const dateStr = assignment.date ? toUTCLocalDateStr(assignment.date) : date;
        if (!dateStr) {
            throw new AppError("Could not determine a shift date to clock in against", 400);
        }

        const tz = assignment.job.store.timezone || "America/Chicago";
        const clockIn = localTimeToUTC(dateStr, time, tz);

        await prisma.jobAssignment.update({
            where: { id: assignmentId },
            data: { clockIn, status: "IN_PROGRESS" }
        });
        await prisma.job.update({
            where: { id: assignment.jobId },
            data: { status: "IN_PROGRESS" }
        });

        return NextResponse.json({ success: true, clockIn });
    } catch (error) {
        return handleApiError(error);
    }
}
