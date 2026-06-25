import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPushToUser } from "@/lib/notifications";
import { sendRecapReminderEmail } from "@/lib/mailer";

export async function GET(request: NextRequest) {
    const secret = request.headers.get("x-cron-secret");
    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneHourAgoThrottled = new Date(now.getTime() - 110 * 60 * 1000); // 110 mins buffer to prevent double-sends within the 2-hour cron window

    // Find all assignments pending recap that clocked out between 1hr and 24hrs ago
    const pending = await prisma.jobAssignment.findMany({
        where: {
            status: "RECAP_PENDING",
            clockOut: { gte: twentyFourHoursAgo, lte: oneHourAgo }
        },
        select: {
            id: true,
            workerId: true,
            worker: { select: { email: true } },
            job: { select: { store: { select: { name: true } } } }
        }
    });

    let sent = 0;

    for (const assignment of pending) {
        try {
            // Skip if we already sent a reminder in the last 50 minutes
            const recentReminder = await prisma.notification.findFirst({
                where: {
                    userId: assignment.workerId,
                    title: "Recap Reminder",
                    createdAt: { gte: oneHourAgoThrottled }
                }
            });
            if (recentReminder) continue;

            const storeName = (assignment.job as any)?.store?.name || "the store";
            const message = `Reminder: You have not completed your recap for your shift at ${storeName}. Please submit it as soon as possible.`;

            await prisma.notification.create({
                data: { userId: assignment.workerId, title: "Recap Reminder", message }
            });

            // Trigger push notification
            sendPushToUser(assignment.workerId, "Recap Reminder", message).catch(() => {});
            
            // Trigger SMTP email notification
            if (assignment.worker?.email) {
                sendRecapReminderEmail(assignment.worker.email, storeName).catch(() => {});
            }
            
            sent++;
        } catch (err) {
            console.error(`[cron/recap-reminder] Failed for assignment ${assignment.id}:`, err);
        }
    }

    console.log(`[cron/recap-reminder] sent=${sent} checked=${pending.length}`);
    return NextResponse.json({ sent, checked: pending.length });
}
