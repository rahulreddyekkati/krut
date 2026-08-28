// Shared payroll calculation logic, used by every Pay Report surface:
//   - apps/web/src/app/api/admin/reports/payroll/route.ts        (summary table)
//   - apps/web/src/app/admin/reports/payroll/print/page.tsx      (print-all view)
//   - apps/web/src/app/admin/reports/payroll/user/[id]/page.tsx  (per-worker drill-down)
//   - apps/web/src/app/api/admin/reports/payroll/user/[id]/csv/route.ts (per-worker CSV)
//   - apps/web/src/app/api/users/route.ts                        (admin-users pay column)
//
// Before this file existed, each of the 4 views above hand-copied the same math
// independently, and drifted apart over time (custom shift times honored in some but not
// others, a workedHours fallback present in some but not others, etc.) — see the payroll
// audit findings. Routing all 4 through this one module is what stops that from happening
// again: fix a formula here once, every view picks it up.

import prisma from "@/lib/prisma";

export interface PayrollAssignmentLike {
    date: Date | string | null;
    clockIn: Date | string | null;
    clockOut: Date | string | null;
    breakTimeMinutes: number | null;
    workedHours: number | null;
    bonus: number | null;
    customStartTimeStr: string | null;
    customEndTimeStr: string | null;
    job: {
        startTimeStr: string | null;
        endTimeStr: string | null;
        bonus: number | null;
    };
    recap?: {
        status: string | null;
        reimbursement: number | null;
        skus?: { bottlesSold: number | null }[] | null;
    } | null;
}

function durationHours(startTimeStr: string, endTimeStr: string): number {
    const [sh, sm] = startTimeStr.split(":").map(Number);
    const [eh, em] = endTimeStr.split(":").map(Number);
    let durationMins = (eh * 60 + em) - (sh * 60 + sm);
    if (durationMins < 0) durationMins += 24 * 60; // overnight shift
    return durationMins / 60;
}

// Assignment-level custom times (set per-worker, e.g. via a reassignment/edit) override the
// Job's default scheduled times. Every view must honor this, or "Assigned Hours" silently
// disagrees between the view that does and the view that doesn't for the same shift.
export function computeAssignedHours(a: PayrollAssignmentLike): number {
    const startTimeStr = a.customStartTimeStr ?? a.job?.startTimeStr;
    const endTimeStr = a.customEndTimeStr ?? a.job?.endTimeStr;
    if (!startTimeStr || !endTimeStr) return 0;
    return durationHours(startTimeStr, endTimeStr);
}

// Trust the stored workedHours (stamped once at clock-out) when present; otherwise fall
// back to a live clockOut-clockIn-break computation. Every view must have this fallback —
// without it, any assignment with real clock times but a null workedHours (legacy data, or
// the recap-approval staleness case below) silently shows 0 hours instead of the real total.
export function computeWorkedHours(a: PayrollAssignmentLike): number {
    if (typeof a.workedHours === "number") return a.workedHours;
    if (a.clockIn && a.clockOut) {
        const diffMins = (new Date(a.clockOut).getTime() - new Date(a.clockIn).getTime()) / 60000;
        const breakMins = a.breakTimeMinutes || 0;
        return Math.max(0, (diffMins - breakMins) / 60);
    }
    return 0;
}

// Per-assignment bonus (set when the shift was assigned to this worker) overrides the
// job-level bonus (set at job creation, shared across every worker/occurrence) — confirmed
// intent: "the one given at the time of assigning the shift to the user should override the
// one that is made with the job creation." Only falls back to job.bonus when the assignment
// has no bonus set at all (null/undefined); an explicit 0 override is respected.
export function computeBonus(a: PayrollAssignmentLike): number {
    if (!a.clockIn) return 0; // unworked/no-show shifts don't earn a bonus
    return a.bonus ?? a.job?.bonus ?? 0;
}

// Reimbursement and bottles-sold only count once the recap is approved — a submitted-but-
// unreviewed (or rejected) amount isn't confirmed pay yet.
export function computeReimbursementAndBottles(a: PayrollAssignmentLike): { reimbursement: number; bottlesSold: number } {
    if (a.recap?.status !== "APPROVED") return { reimbursement: 0, bottlesSold: 0 };
    const reimbursement = a.recap.reimbursement || 0;
    const bottlesSold = (a.recap.skus || []).reduce((sum, s) => sum + (s.bottlesSold || 0), 0);
    return { reimbursement, bottlesSold };
}

export interface PayrollTotals {
    totalAssignedHours: number;
    totalWorkedHours: number;
    totalReimbursements: number;
    totalBonus: number;
    totalBottlesSold: number;
    // Only populated when a rateForAssignment resolver is passed to accumulatePayrollTotals —
    // sum of computeWorkedHours(a) * rateForAssignment(a) per assignment, i.e. wages priced at
    // each shift's own effective rate (see apps/web/src/lib/payRate.ts) rather than one flat
    // rate applied to the whole total. Undefined for legacy callers.
    totalWage?: number;
}

export function accumulatePayrollTotals(
    assignments: PayrollAssignmentLike[],
    rateForAssignment?: (a: PayrollAssignmentLike) => number
): PayrollTotals {
    const totals: PayrollTotals = {
        totalAssignedHours: 0,
        totalWorkedHours: 0,
        totalReimbursements: 0,
        totalBonus: 0,
        totalBottlesSold: 0,
        ...(rateForAssignment ? { totalWage: 0 } : {}),
    };
    for (const a of assignments) {
        const workedHours = computeWorkedHours(a);
        totals.totalAssignedHours += computeAssignedHours(a);
        totals.totalWorkedHours += workedHours;
        totals.totalBonus += computeBonus(a);
        const { reimbursement, bottlesSold } = computeReimbursementAndBottles(a);
        totals.totalReimbursements += reimbursement;
        totals.totalBottlesSold += bottlesSold;
        if (rateForAssignment) {
            totals.totalWage = (totals.totalWage || 0) + workedHours * rateForAssignment(a);
        }
    }
    return totals;
}

export interface PayFigures {
    payForCycle: number;
    taxablePay: number;
}

// Everything except reimbursement counts as taxable income — wages and bonus are both
// taxable, reimbursement (expense repayment) isn't.
export function computePayFigures(hourlyWage: number, totals: Pick<PayrollTotals, "totalWorkedHours" | "totalReimbursements" | "totalBonus">): PayFigures {
    const payForCycle = (totals.totalWorkedHours * hourlyWage) + totals.totalReimbursements + totals.totalBonus;
    const taxablePay = payForCycle - totals.totalReimbursements;
    return { payForCycle, taxablePay };
}

// Effective-dated-rate counterpart to computePayFigures — consumes a pre-computed totalWage
// (hours already priced per-shift at the rate that was in effect on each shift's own date,
// via accumulatePayrollTotals(assignments, rateForAssignment)) instead of one flat hourlyWage
// applied to the whole cycle. computePayFigures above is left untouched for any caller that
// doesn't need effective-dated rates.
export function computePayFiguresFromWage(totals: Pick<PayrollTotals, "totalWage" | "totalReimbursements" | "totalBonus">): PayFigures {
    const payForCycle = (totals.totalWage || 0) + totals.totalReimbursements + totals.totalBonus;
    const taxablePay = payForCycle - totals.totalReimbursements;
    return { payForCycle, taxablePay };
}

export interface DateMarkerRange {
    dateMarkerStart: Date;
    dateMarkerEnd: Date;
}

// JobAssignment.date is a pure UTC-midnight calendar marker (e.g. Aug 1 is always exactly
// 2026-08-01T00:00:00.000Z), not a real clock time — it must only ever be compared against
// another marker like this, never against a real-time boundary (see the payroll route for
// the full "why" — comparing it to a timezone-resolved end-of-day leaks the next day's
// shifts into the cycle).
export function buildDateMarkerRange(startDateStr: string, endDateStr: string): DateMarkerRange {
    return {
        dateMarkerStart: new Date(`${startDateStr}T00:00:00.000Z`),
        dateMarkerEnd: new Date(`${endDateStr}T00:00:00.000Z`),
    };
}

// The Prisma `where` fragment for "does this assignment belong to this cycle" — fixes the
// cross-cycle double-counting bug: an assignment with a `date` marker is ALWAYS attributed
// by that marker alone (a fixed date value can only ever fall inside one of two adjacent,
// non-overlapping cycle ranges, so it can never match two cycle queries at once). The
// real-time `clockIn` window is only used as a fallback for assignments that have no `date`
// at all — previously this was a plain OR between the two, which let an assignment whose
// `date` and actual local-calendar-day-of-clockIn disagreed (an overnight shift near a
// cycle boundary) match both an assignment's own cycle AND the adjacent one.
export function buildCycleAssignmentWhere(dateMarkerRange: DateMarkerRange, realTimeStart: Date, realTimeEnd: Date) {
    return {
        OR: [
            { date: { gte: dateMarkerRange.dateMarkerStart, lte: dateMarkerRange.dateMarkerEnd } },
            { date: null, clockIn: { gte: realTimeStart, lte: realTimeEnd } },
        ],
    };
}

// A single Prisma query can't apply a different exact real-time boundary per market, so the
// query above is run with a padded (generously wide) window to safely over-fetch candidates.
// This does the precise per-market re-check afterward, in JS, for the one case where it
// matters: a date-less assignment (assignment.date === null) that only matched via the
// padded clockIn window. Assignments with a `date` marker are already exactly correct from
// the query alone and always belong (a fixed marker can only fall in one non-overlapping
// cycle range), so this always returns true for them without needing a market timezone at
// all — it's only ever a real check for the rare date-less fallback case.
export function assignmentBelongsToCyclePreciseCheck(
    a: { date: Date | string | null; clockIn: Date | string | null },
    preciseRealTimeStart: Date,
    preciseRealTimeEnd: Date
): boolean {
    if (a.date) return true;
    if (!a.clockIn) return false;
    const ci = new Date(a.clockIn).getTime();
    return ci >= preciseRealTimeStart.getTime() && ci <= preciseRealTimeEnd.getTime();
}

// --- Released-shift hours subtraction ---
//
// A released shift's JobAssignment row survives the release itself: approving a release
// only flips `status` to AVAILABLE and stamps `releasedByWorkerId` — `workerId` stays the
// releasing worker's until another worker claims it (see
// shift-assign-requests/[id]/approve/route.ts), at which point `workerId` on that SAME row
// is TRANSFERRED to the claimant. Once that happens, the assignment silently drops out of
// the original releaser's own assignment list — their totalAssignedHours no longer
// includes it at all, with zero help needed from this file.
//
// A naive "subtract every approved release's duration from this worker's assigned hours"
// step doesn't know that, and subtracts it anyway — double-subtracting hours that were
// never counted for this worker in the current total. That can drive the total negative
// and get clamped to 0, wiping out this worker's OTHER, completely unrelated, still-worked
// shifts' assigned hours for the same cycle (confirmed in production: a worker's Assigned
// Hours showed 0 despite one fully-worked, fully-approved shift, because an unrelated
// released-and-reassigned shift's hours were subtracted from a total that never included
// them). Only subtract a release's hours when its assignment is still actually owned by
// the releasing worker right now.

export interface ReleaseRequestLike {
    workerId: string;
    assignmentId: string | null;
    jobId: string;
    date: Date | string | null;
    job: { startTimeStr: string; endTimeStr: string };
}

// Batch-resolves, once per report generation (never per-release), whether each release's
// underlying assignment is still owned by the worker who released it. Returns a predicate
// to pass into sumReleaseHoursToSubtract below.
export async function resolveReleasesStillOwned(
    releases: ReleaseRequestLike[]
): Promise<(rel: ReleaseRequestLike) => boolean> {
    const withAssignmentId = releases.filter((r) => r.assignmentId);
    const assignments = withAssignmentId.length
        ? await prisma.jobAssignment.findMany({
              where: { id: { in: withAssignmentId.map((r) => r.assignmentId as string) } },
              select: { id: true, workerId: true },
          })
        : [];
    const ownerByAssignmentId = new Map(assignments.map((a) => [a.id, a.workerId]));

    // Legacy releases with no assignmentId on file (rare — see the approve route's own
    // fallback match) are resolved individually by job + date + worker; the volume here is
    // expected to be small enough that per-release queries are fine.
    const legacyKey = (jobId: string, date: Date | string) => `${jobId}|${new Date(date).toISOString().slice(0, 10)}`;
    const legacyOwned = new Set<string>();
    for (const rel of releases) {
        if (rel.assignmentId || !rel.date) continue;
        const dayStart = new Date(rel.date); dayStart.setUTCHours(0, 0, 0, 0);
        const dayEnd = new Date(rel.date); dayEnd.setUTCHours(23, 59, 59, 999);
        const found = await prisma.jobAssignment.findFirst({
            where: { jobId: rel.jobId, workerId: rel.workerId, date: { gte: dayStart, lte: dayEnd } },
            select: { id: true },
        });
        if (found) legacyOwned.add(legacyKey(rel.jobId, rel.date));
    }

    return (rel: ReleaseRequestLike) => {
        if (rel.assignmentId) return ownerByAssignmentId.get(rel.assignmentId) === rel.workerId;
        if (!rel.date) return false;
        return legacyOwned.has(legacyKey(rel.jobId, rel.date));
    };
}

// Sums the hours to subtract from one worker's assigned-hours total — every release in
// `releases` for which `stillOwned(rel)` is true (see resolveReleasesStillOwned above).
export function sumReleaseHoursToSubtract(
    releases: ReleaseRequestLike[],
    stillOwned: (rel: ReleaseRequestLike) => boolean
): number {
    let total = 0;
    for (const rel of releases) {
        if (!stillOwned(rel)) continue;
        if (!rel.job.startTimeStr || !rel.job.endTimeStr) continue;
        total += durationHours(rel.job.startTimeStr, rel.job.endTimeStr);
    }
    return total;
}
