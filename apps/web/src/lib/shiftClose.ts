import { localShiftEndToUTC, toLocalDateStr } from "@/lib/timezone";

// Fallback only — every store should carry its own timezone (Store.timezone).
const FALLBACK_TZ = "America/Chicago";

export interface ClosableAssignment {
    id: string;
    jobId: string;
    date: Date | null;
    clockIn: Date | null;
    customStartTimeStr?: string | null;
    customEndTimeStr?: string | null;
    job: { startTimeStr: string; endTimeStr: string; store?: { timezone?: string | null } | null };
    breaks: { id: string; startTime: Date }[];
}

/**
 * When a clocked-in shift should end, as a UTC instant, in its store's own timezone.
 * If the schedule puts the end at or before clock-in (data error), falls back to
 * clockIn + scheduled duration so the shift never ends before it started.
 */
export function scheduledShiftEnd(a: ClosableAssignment): Date {
    const tz = a.job.store?.timezone || FALLBACK_TZ;
    const startTimeStr = a.customStartTimeStr ?? a.job.startTimeStr;
    const endTimeStr = a.customEndTimeStr ?? a.job.endTimeStr;
    const shiftDateStr = a.date
        ? new Date(a.date).toISOString().split("T")[0]
        : toLocalDateStr(new Date(a.clockIn!), tz);

    const scheduled = localShiftEndToUTC(shiftDateStr, startTimeStr, endTimeStr, tz);
    if (a.clockIn && scheduled.getTime() <= a.clockIn.getTime()) {
        const [sH, sM] = startTimeStr.split(":").map(Number);
        const [eH, eM] = endTimeStr.split(":").map(Number);
        const durationMins = ((eH * 60 + eM) - (sH * 60 + sM) + 1440) % 1440;
        return new Date(a.clockIn.getTime() + durationMins * 60 * 1000);
    }
    return scheduled;
}

/**
 * Clocks a shift out at `at` inside an existing transaction: closes any open break,
 * stamps clockOut + workedHours (breaks subtracted), and moves the shift and its job to
 * RECAP_PENDING. Shared by the auto-clockout cron and account deactivation so both
 * compute hours the same way.
 */
export async function closeOutAssignment(tx: any, a: ClosableAssignment, at: Date): Promise<number> {
    let extraBreakMins = 0;
    for (const br of a.breaks) {
        const mins = Math.max(0, (at.getTime() - new Date(br.startTime).getTime()) / 60000);
        await tx.break.update({
            where: { id: br.id },
            data: { endTime: at, durationMins: mins }
        });
        extraBreakMins += mins;
    }

    if (extraBreakMins > 0) {
        await tx.jobAssignment.update({
            where: { id: a.id },
            data: { breakTimeMinutes: { increment: extraBreakMins } }
        });
    }

    // Re-read breakTimeMinutes after the increment
    const fresh = await tx.jobAssignment.findUnique({
        where: { id: a.id },
        select: { breakTimeMinutes: true }
    });

    const grossMins = (at.getTime() - a.clockIn!.getTime()) / 60000;
    const breakMins = fresh?.breakTimeMinutes ?? 0;
    const workedHours = parseFloat(Math.max(0, (grossMins - breakMins) / 60).toFixed(2));

    await tx.jobAssignment.update({
        where: { id: a.id },
        data: { clockOut: at, workedHours, status: "RECAP_PENDING" }
    });

    await tx.job.update({
        where: { id: a.jobId },
        data: { status: "RECAP_PENDING" }
    });

    return workedHours;
}
