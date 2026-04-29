import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { localShiftEndToUTC, toLocalDateStr } from "@/lib/timezone";

const TZ = "America/Chicago";

export async function GET(request: NextRequest) {
    // Vercel cron calls this with a secret header to prevent public access
    const secret = request.headers.get("x-cron-secret");
    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    let processed = 0;
    let errors = 0;

    // Find every assignment that is clocked in but not yet clocked out
    const stuck = await prisma.jobAssignment.findMany({
        where: { clockIn: { not: null }, clockOut: null },
        include: {
            job: { select: { id: true, startTimeStr: true, endTimeStr: true } },
            breaks: { where: { endTime: null } }
        }
    });

    for (const assignment of stuck) {
        try {
            const startTimeStr = assignment.job.startTimeStr;
            const endTimeStr = (assignment as any).customEndTimeStr ?? assignment.job.endTimeStr;

            const shiftDateStr = assignment.date
                ? toLocalDateStr(new Date(assignment.date), TZ)
                : toLocalDateStr(new Date(assignment.clockIn!), TZ);

            // Compute when the shift should have ended in UTC
            const scheduledClockOut = localShiftEndToUTC(shiftDateStr, startTimeStr, endTimeStr, TZ);

            // Only auto-clock-out if that time has already passed
            if (scheduledClockOut.getTime() > now.getTime()) continue;

            // If scheduled end is before clock-in (data error), use clockIn + shift duration
            let finalClockOut = scheduledClockOut;
            if (scheduledClockOut.getTime() <= assignment.clockIn!.getTime()) {
                const [sH, sM] = startTimeStr.split(":").map(Number);
                const [eH, eM] = endTimeStr.split(":").map(Number);
                const durationMins = ((eH * 60 + eM) - (sH * 60 + sM) + 1440) % 1440;
                finalClockOut = new Date(assignment.clockIn!.getTime() + durationMins * 60 * 1000);
            }

            await prisma.$transaction(async (tx: any) => {
                // Close any open break first
                let extraBreakMins = 0;
                for (const br of assignment.breaks) {
                    const mins = (finalClockOut.getTime() - new Date(br.startTime).getTime()) / 60000;
                    await tx.break.update({
                        where: { id: br.id },
                        data: { endTime: finalClockOut, durationMins: Math.max(0, mins) }
                    });
                    extraBreakMins += Math.max(0, mins);
                }

                if (extraBreakMins > 0) {
                    await tx.jobAssignment.update({
                        where: { id: assignment.id },
                        data: { breakTimeMinutes: { increment: extraBreakMins } }
                    });
                }

                // Re-read breakTimeMinutes after the increment
                const fresh = await tx.jobAssignment.findUnique({
                    where: { id: assignment.id },
                    select: { breakTimeMinutes: true }
                });

                const grossMins = (finalClockOut.getTime() - assignment.clockIn!.getTime()) / 60000;
                const breakMins = (fresh?.breakTimeMinutes ?? 0);
                const workedHours = parseFloat(Math.max(0, (grossMins - breakMins) / 60).toFixed(2));

                await tx.jobAssignment.update({
                    where: { id: assignment.id },
                    data: { clockOut: finalClockOut, workedHours, status: "RECAP_PENDING" }
                });

                await tx.job.update({
                    where: { id: assignment.jobId },
                    data: { status: "RECAP_PENDING" }
                });

                await tx.notification.create({
                    data: {
                        userId: assignment.workerId,
                        title: "Auto Clocked Out",
                        message: "You were automatically clocked out at your shift end time. Please submit your recap."
                    }
                });
            });

            processed++;
        } catch (err) {
            console.error(`[cron/auto-clockout] Failed for assignment ${assignment.id}:`, err);
            errors++;
        }
    }

    console.log(`[cron/auto-clockout] processed=${processed} errors=${errors} checked=${stuck.length}`);
    return NextResponse.json({ processed, errors, checked: stuck.length });
}
