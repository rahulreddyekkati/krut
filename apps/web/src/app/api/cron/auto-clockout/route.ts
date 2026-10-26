import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { localShiftEndToUTC, toLocalDateStr } from "@/lib/timezone";
import { sendPushToUser } from "@/lib/notifications";
import { scheduledShiftEnd, closeOutAssignment } from "@/lib/shiftClose";

// Fallback only — every store should carry its own timezone (Store.timezone).
// Used to exist as a single hardcoded constant here, which silently auto-clocked
// out Mountain-time stores (e.g. El Paso, Colorado) an hour early. Do not revert
// to a single shared TZ; always resolve per-assignment via assignment.job.store.timezone.
const FALLBACK_TZ = "America/Chicago";

export async function GET(request: NextRequest) {
    // Vercel cron sends Authorization: Bearer <CRON_SECRET>; keep x-cron-secret as a fallback
    const authHeader = request.headers.get("authorization");
    const legacySecret = request.headers.get("x-cron-secret");
    const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (process.env.CRON_SECRET !== bearerSecret && process.env.CRON_SECRET !== legacySecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    let processed = 0;
    let errors = 0;

    // Find every assignment that is clocked in but not yet clocked out
    const stuck = await prisma.jobAssignment.findMany({
        where: { clockIn: { not: null }, clockOut: null },
        include: {
            job: { select: { id: true, startTimeStr: true, endTimeStr: true, store: { select: { timezone: true } } } },
            breaks: { where: { endTime: null } }
        }
    });

    // Send 1-hour warning to workers whose shift ends in ~1 hour
    for (const assignment of stuck) {
        try {
            const tz = assignment.job.store?.timezone || FALLBACK_TZ;
            const startTimeStr = (assignment as any).customStartTimeStr ?? assignment.job.startTimeStr;
            const endTimeStr = (assignment as any).customEndTimeStr ?? assignment.job.endTimeStr;
            const shiftDateStr = assignment.date
                ? new Date(assignment.date).toISOString().split('T')[0]
                : toLocalDateStr(new Date(assignment.clockIn!), tz);
            const scheduledEnd = localShiftEndToUTC(shiftDateStr, startTimeStr, endTimeStr, tz);
            const minutesUntilEnd = (scheduledEnd.getTime() - now.getTime()) / 60000;

            if (minutesUntilEnd >= 55 && minutesUntilEnd <= 65) {
                await prisma.notification.create({
                    data: {
                        userId: assignment.workerId,
                        title: "Shift Ending Soon",
                        message: "Your shift ends in 1 hour. Please prepare to clock out."
                    }
                });
                sendPushToUser(
                    assignment.workerId,
                    "Shift Ending Soon",
                    "Your shift ends in 1 hour. Please prepare to clock out."
                ).catch(() => {});
            }
        } catch (err) {
            console.error(`[cron/auto-clockout] Warning check failed for ${(assignment as any).id}:`, err);
        }
    }

    for (const assignment of stuck) {
        try {
            // Compute when the shift should have ended in UTC (store timezone)
            const finalClockOut = scheduledShiftEnd(assignment as any);

            // Only auto-clock-out if that time has already passed
            if (finalClockOut.getTime() > now.getTime()) continue;

            await prisma.$transaction(async (tx: any) => {
                await closeOutAssignment(tx, assignment as any, finalClockOut);

                await tx.notification.create({
                    data: {
                        userId: assignment.workerId,
                        title: "Auto Clocked Out",
                        message: "You were automatically clocked out at your shift end time. Please submit your recap."
                    }
                });
            });

            sendPushToUser(
                assignment.workerId,
                "Auto Clocked Out",
                "You were automatically clocked out at your shift end time. Please submit your recap."
            ).catch(() => {});

            processed++;
        } catch (err) {
            console.error(`[cron/auto-clockout] Failed for assignment ${assignment.id}:`, err);
            errors++;
        }
    }

    console.log(`[cron/auto-clockout] processed=${processed} errors=${errors} checked=${stuck.length}`);
    return NextResponse.json({ processed, errors, checked: stuck.length });
}
