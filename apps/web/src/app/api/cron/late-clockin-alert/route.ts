import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { localTimeToUTC, toUTCLocalDateStr } from "@/lib/timezone";
import { to12hr } from "@/lib/timeFormat";
import { ensureCurrentCycleAssignments } from "@/lib/recurringShifts";
import { sendLateClockInAlertEmail } from "@/lib/mailer";

const LATE_THRESHOLD_MIN = 30;
// Scheduled every 15 min (see vercel.json) — a straggler is only ever caught in the first
// run where they land in [30, 45) minutes late, so each late shift generates exactly one
// alert instead of resending on every subsequent run for the rest of the day. Mirrors the
// same windowing trick auto-clockout/route.ts uses for its 1-hour-left warning.
const WINDOW_MIN = 15;

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        const legacySecret = request.headers.get("x-cron-secret");
        const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (process.env.CRON_SECRET !== bearerSecret && process.env.CRON_SECRET !== legacySecret) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const recipients = (process.env.LATE_CLOCKIN_ALERT_EMAIL || "")
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean);
        if (recipients.length === 0) {
            console.warn("[cron/late-clockin-alert] LATE_CLOCKIN_ALERT_EMAIL not configured — skipping");
            return NextResponse.json({ skipped: true, reason: "LATE_CLOCKIN_ALERT_EMAIL not configured" });
        }

        // A worker's shift row for today may not exist yet if nobody has opened the app
        // this cycle (see ensureCurrentCycleAssignments) — without this, a late worker who
        // hasn't touched the app at all would be silently invisible to the query below.
        const activeWorkers = await prisma.user.findMany({
            where: { role: "WORKER", status: "ACTIVE" },
            select: { id: true }
        });
        for (const w of activeWorkers) {
            try {
                await ensureCurrentCycleAssignments(w.id);
            } catch (e) {
                console.error(`[cron/late-clockin-alert] rollover failed for worker ${w.id}:`, e);
            }
        }

        const now = new Date();
        const assignments = await prisma.jobAssignment.findMany({
            where: {
                status: "ASSIGNED",
                date: { not: null },
                clockIn: null
            },
            include: {
                worker: { select: { name: true } },
                job: { include: { store: true, market: true } }
            }
        });

        const lateWorkers: { name: string; storeName: string; startTime: string; minutesLate: number }[] = [];

        for (const a of assignments) {
            try {
                if (!a.date) continue;
                const dateStr = toUTCLocalDateStr(new Date(a.date));
                // Store timezone wins; market timezone is the secondary fallback (see
                // Market.timezone), hardcoded Central only as a last resort.
                const tz = a.job.store?.timezone || a.job.market?.timezone || "America/Chicago";
                const startTimeStr = a.customStartTimeStr ?? a.job.startTimeStr;
                const shiftStart = localTimeToUTC(dateStr, startTimeStr, tz);

                const minutesLate = (now.getTime() - shiftStart.getTime()) / 60000;
                if (minutesLate >= LATE_THRESHOLD_MIN && minutesLate < LATE_THRESHOLD_MIN + WINDOW_MIN) {
                    lateWorkers.push({
                        name: a.worker?.name || "Unknown",
                        storeName: a.job.store?.name || "Unknown store",
                        startTime: to12hr(startTimeStr),
                        minutesLate: Math.round(minutesLate)
                    });
                }
            } catch (err) {
                console.error(`[cron/late-clockin-alert] Failed for assignment ${a.id}:`, err);
            }
        }

        let emailed = false;
        if (lateWorkers.length > 0) {
            emailed = await sendLateClockInAlertEmail(recipients, lateWorkers);
        }

        return NextResponse.json({ checked: assignments.length, late: lateWorkers.length, emailed, names: lateWorkers.map((w) => w.name) });
    } catch (error) {
        console.error("[cron/late-clockin-alert] Global error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
