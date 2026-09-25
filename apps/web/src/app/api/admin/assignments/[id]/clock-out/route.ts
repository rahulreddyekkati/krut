import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { localTimeToUTC, toUTCLocalDateStr } from "@/lib/timezone";

// POST /api/admin/assignments/[id]/clock-out
// Manual admin correction: records a clock-out for a worker who couldn't clock out via the
// app (app issue, forgot phone, etc). Mirrors what the real clock-out endpoint does — sets
// clockOut + status RECAP_PENDING, closes any open break, computes workedHours, flips the
// Job's status, and fires the same "Recap Required" notification — but lets the admin pick
// the time directly instead of using "now". See apps/web/src/app/api/timeclock/route.ts
// (CLOCK_OUT branch) for the worker-facing version this is modeled on, and the sibling
// clock-in/route.ts for the manual clock-in this mirrors.
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
                job: { include: { store: { select: { name: true, timezone: true, marketId: true } } } }
            }
        });

        if (!assignment) {
            throw new AppError("Assignment not found", 404);
        }

        // Market Manager scope check
        if (user.role === "MARKET_MANAGER" && assignment.job.store.marketId !== user.managedMarketId) {
            throw new AppError("Unauthorized: Assignment outside your market", 403);
        }

        if (!assignment.clockIn) {
            throw new AppError("This shift hasn't been clocked in yet", 400);
        }
        if (assignment.clockOut) {
            throw new AppError("This shift is already clocked out — edit the shift instead", 400);
        }

        const dateStr = assignment.date ? toUTCLocalDateStr(assignment.date) : date;
        if (!dateStr) {
            throw new AppError("Could not determine a shift date to clock out against", 400);
        }

        const tz = assignment.job.store.timezone || "America/Chicago";
        const clockOutTime = localTimeToUTC(dateStr, time, tz);

        if (clockOutTime.getTime() <= assignment.clockIn.getTime()) {
            throw new AppError("Clock-out time must be after the clock-in time", 400);
        }

        const result = await prisma.$transaction(async (tx) => {
            const activeBreak = await tx.break.findFirst({
                where: { assignmentId, endTime: null }
            });
            if (activeBreak) {
                const breakMins = (clockOutTime.getTime() - activeBreak.startTime.getTime()) / 60000;
                await tx.break.update({
                    where: { id: activeBreak.id },
                    data: { endTime: clockOutTime, durationMins: breakMins }
                });
                await tx.jobAssignment.update({
                    where: { id: assignmentId },
                    data: { breakTimeMinutes: { increment: breakMins } }
                });
            }

            const fresh = await tx.jobAssignment.findUnique({ where: { id: assignmentId } });
            const grossMinutes = (clockOutTime.getTime() - assignment.clockIn!.getTime()) / 60000;
            const breakMinutes = fresh?.breakTimeMinutes ?? 0;
            const workedHours = parseFloat(Math.max(0, (grossMinutes - breakMinutes) / 60).toFixed(2));

            await tx.jobAssignment.update({
                where: { id: assignmentId },
                data: { clockOut: clockOutTime, status: "RECAP_PENDING", workedHours }
            });

            await tx.job.update({
                where: { id: assignment.jobId },
                data: { status: "RECAP_PENDING" }
            });

            await tx.notification.create({
                data: {
                    userId: assignment.workerId,
                    title: "Recap Required",
                    message: `Please submit your recap for your shift at ${assignment.job.store?.name || "the store"}. You have clocked out — don't forget to submit your recap.`
                }
            });

            return { clockOut: clockOutTime, workedHours };
        });

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        return handleApiError(error);
    }
}
