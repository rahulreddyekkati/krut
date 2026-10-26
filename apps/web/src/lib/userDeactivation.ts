import prisma from "@/lib/prisma";
import { AppError } from "@/lib/apiError";
import { resolveStoreTimezone, storeToday } from "@/lib/timezone";
import { scheduledShiftEnd, closeOutAssignment } from "@/lib/shiftClose";

export interface DeactivationResult {
    removedShifts: number;
    clockedOut: boolean;
    // Clock-outs capped at the scheduled shift end (worker was still clocked in past it)
    flaggedForReview: number;
}

/**
 * True when an unworked shift should be dropped on deactivation: an undated recurring
 * template, or a dated shift on or after today *in its own store's timezone*. Today's
 * shift goes even if its start time has passed — it was never clocked into.
 */
export function isRemovableFutureShift(
    a: { date: Date | null; isRecurring: boolean; job: { store?: { timezone?: string | null } | null; market?: { timezone?: string | null } | null } },
    now: Date = new Date()
): boolean {
    if (!a.date) return a.isRecurring;
    const tz = resolveStoreTimezone(a.job.store, a.job.market);
    return a.date.getTime() >= storeToday(tz, now).getTime();
}

/**
 * Deactivates an account instead of deleting it: blocks access, clocks out a running
 * shift, drops unworked upcoming shifts, stops recurring patterns from rolling over and
 * cancels pending requests. Worked history (shifts, recaps, payroll, messages) is kept,
 * which is why this replaces the old hard delete (FK Restrict made that fail anyway).
 */
export async function deactivateUser(targetId: string, actorId: string, now: Date = new Date()): Promise<DeactivationResult> {
    if (targetId === actorId) throw new AppError("You can't deactivate your own account", 400);

    return prisma.$transaction(async (tx: any) => {
        const target = await tx.user.findUnique({ where: { id: targetId }, select: { id: true, role: true } });
        if (!target) throw new AppError("User not found", 404);

        // Conditional write, not the read above, decides who wins: of two concurrent calls
        // (double-click, two admins) only one sees count === 1.
        const claimed = await tx.user.updateMany({
            where: { id: targetId, status: { not: "DEACTIVATED" } },
            data: { status: "DEACTIVATED", expoPushToken: null }
        });
        if (claimed.count === 0) throw new AppError("User is already deactivated", 409);

        if (target.role === "ADMIN") {
            const activeAdmins = await tx.user.count({ where: { role: "ADMIN", status: "ACTIVE" } });
            if (activeAdmins === 0) throw new AppError("Can't deactivate the last active admin", 400);
        }

        // 1. Clock out a running shift, at shift end if they're already past it.
        let clockedOut = false;
        let flaggedForReview = 0;
        const running = await tx.jobAssignment.findMany({
            where: { workerId: targetId, clockIn: { not: null }, clockOut: null },
            include: {
                job: { select: { startTimeStr: true, endTimeStr: true, store: { select: { timezone: true } } } },
                breaks: { where: { endTime: null } }
            }
        });
        for (const a of running) {
            const end = scheduledShiftEnd(a);
            const capped = end.getTime() < now.getTime();
            await closeOutAssignment(tx, a, capped ? end : now);
            clockedOut = true;
            if (capped) flaggedForReview++;
        }

        // 2. Drop unworked upcoming shifts. Anything with clock-in data, a recap or a
        // sample request is worked history and stays.
        const unworked = await tx.jobAssignment.findMany({
            where: {
                workerId: targetId,
                status: "ASSIGNED",
                clockIn: null,
                recap: { is: null },
                sampleRequests: { none: {} }
            },
            select: {
                id: true, jobId: true, date: true, isRecurring: true,
                job: { select: { store: { select: { timezone: true } }, market: { select: { timezone: true } } } }
            }
        });
        const removable = unworked.filter((a: any) => isRemovableFutureShift(a, now));
        const removedIds: string[] = removable.map((a: any) => a.id);

        if (removedIds.length > 0) {
            await tx.releaseRequest.updateMany({
                where: { assignmentId: { in: removedIds }, status: "PENDING" },
                data: { status: "CANCELLED" }
            });
            await tx.jobAssignment.deleteMany({ where: { id: { in: removedIds } } });

            // A job left with nobody on it goes back to OPEN so it shows as unstaffed.
            const jobIds = [...new Set(removable.map((a: any) => a.jobId))];
            for (const jobId of jobIds) {
                const left = await tx.jobAssignment.count({ where: { jobId } });
                if (left === 0) {
                    await tx.job.updateMany({ where: { id: jobId, status: "ASSIGNED" }, data: { status: "OPEN" } });
                }
            }
        }

        // 3. Stop recurring patterns: rollover copies the previous cycle's isRecurring rows
        // forward, so un-flag what's left (same approach as deleting a pattern in
        // users/[id]/assignments). The rows themselves stay as history.
        const unflagged = await tx.jobAssignment.updateMany({
            where: { workerId: targetId, isRecurring: true },
            data: { isRecurring: false }
        });

        // 4. Cancel pending requests so they don't sit in approval queues.
        await tx.releaseRequest.updateMany({ where: { workerId: targetId, status: "PENDING" }, data: { status: "CANCELLED" } });
        await tx.shiftRequest.updateMany({ where: { workerId: targetId, status: "PENDING" }, data: { status: "CANCELLED" } });

        await tx.auditLog.create({
            data: {
                actorId,
                action: "USER_DEACTIVATED",
                entityType: "User",
                entityId: targetId,
                newValue: JSON.stringify({
                    removedAssignmentIds: removedIds,
                    recurringUnflagged: unflagged.count,
                    clockedOutAssignmentIds: running.map((a: any) => a.id),
                    flaggedForReview,
                }),
            }
        });

        return { removedShifts: removedIds.length, clockedOut, flaggedForReview };
    }, { timeout: 20000 });
}

/** Restores access only. Removed shifts and cancelled requests are not brought back. */
export async function reactivateUser(targetId: string, actorId: string): Promise<void> {
    await prisma.$transaction(async (tx: any) => {
        const res = await tx.user.updateMany({
            where: { id: targetId, status: "DEACTIVATED" },
            data: { status: "ACTIVE" }
        });
        if (res.count === 0) {
            const exists = await tx.user.count({ where: { id: targetId } });
            throw new AppError(exists ? "User is not deactivated" : "User not found", exists ? 409 : 404);
        }
        await tx.auditLog.create({
            data: { actorId, action: "USER_REACTIVATED", entityType: "User", entityId: targetId }
        });
    });
}

/**
 * Returns an error message if a shift can't be given to this worker, else null. Used by
 * every admin assign path so a deactivated worker can't be scheduled through the API
 * even though the pickers already hide them.
 */
export async function unassignableWorkerError(workerId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({ where: { id: workerId }, select: { status: true } });
    if (!user) return "Worker not found";
    if (user.status === "DEACTIVATED" || user.status === "SUSPENDED") return "Worker is deactivated";
    return null;
}
