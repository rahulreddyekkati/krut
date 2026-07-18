import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPushToUser } from "@/lib/notifications";
import { localTimeToUTC, toUTCLocalDateStr, getMarketTimezone } from "@/lib/timezone";
import { to12hr } from "@/lib/timeFormat";

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        const legacySecret = request.headers.get("x-cron-secret");
        const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (process.env.CRON_SECRET !== bearerSecret && process.env.CRON_SECRET !== legacySecret) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const now = new Date();
        const minDiffMs = 1.75 * 60 * 60 * 1000; // 1hr 45m
        const maxDiffMs = 2.25 * 60 * 60 * 1000; // 2hr 15m

        const assignments = await prisma.jobAssignment.findMany({
            where: {
                status: "ASSIGNED",
                date: { not: null }
            },
            include: {
                worker: true,
                job: {
                    include: {
                        store: true,
                        market: true
                    }
                }
            }
        });

        let sent = 0;

        for (const assignment of assignments) {
            try {
                if (!assignment.date) continue;
                const dateStr = toUTCLocalDateStr(new Date(assignment.date));
                const marketName = assignment.job.market?.name || "";
                const storeAddress = assignment.job.store?.address || "";
                const tz = getMarketTimezone(marketName, storeAddress);
                const shiftStart = localTimeToUTC(dateStr, assignment.customStartTimeStr ?? assignment.job.startTimeStr, tz);
                
                const diffMs = shiftStart.getTime() - now.getTime();
                if (diffMs >= minDiffMs && diffMs <= maxDiffMs) {
                    // Prevent duplicate reminder
                    const existing = await prisma.notification.findFirst({
                        where: {
                            userId: assignment.workerId,
                            title: "Upcoming Shift Reminder",
                            message: { contains: assignment.id }
                        }
                    });
                    if (existing) continue;

                    const startTimeStr = assignment.customStartTimeStr ?? assignment.job.startTimeStr;
                    const start12 = to12hr(startTimeStr);
                    const storeName = assignment.job.store.name;
                    const message = `Reminder: You have an upcoming shift at ${storeName} starting at ${start12} today. (Ref: ${assignment.id})`;

                    await prisma.notification.create({
                        data: {
                            userId: assignment.workerId,
                            title: "Upcoming Shift Reminder",
                            message
                        }
                    });

                    await sendPushToUser(assignment.workerId, "Upcoming Shift Reminder", message).catch(() => {});
                    sent++;
                }
            } catch (err) {
                console.error(`[cron/shift-reminder] Failed for assignment ${assignment.id}:`, err);
            }
        }

        return NextResponse.json({ sent });
    } catch (error) {
        console.error("[cron/shift-reminder] Global error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
