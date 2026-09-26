import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { isCanonicalCycle } from "@/lib/cycles";

// Allow a little clock skew between the admin's browser and the server.
const FUTURE_GRACE_MS = 5 * 60 * 1000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_WORKERS = 1000;
// Turso round-trips add up; the default 5s interactive-transaction timeout is too tight.
const TX_OPTS = { timeout: 30000, maxWait: 10000 };

function parsePeriod(body: any) {
    const { startDate, endDate } = body || {};
    if (typeof startDate !== "string" || typeof endDate !== "string" || !DATE_RE.test(startDate) || !DATE_RE.test(endDate)) {
        throw new AppError("startDate and endDate must be YYYY-MM-DD", 400);
    }
    if (startDate > endDate) {
        throw new AppError("startDate must be on or before endDate", 400);
    }
    if (!isCanonicalCycle(startDate, endDate)) {
        throw new AppError("Payments can only be recorded for a full pay cycle (1st–15th or 16th–end of month)", 400);
    }
    return { periodStart: startDate, periodEnd: endDate };
}

function parseWorkerIds(ids: unknown): string[] {
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new AppError("At least one worker is required", 400);
    }
    if (ids.length > MAX_WORKERS) {
        throw new AppError(`Too many workers in one request (max ${MAX_WORKERS})`, 400);
    }
    if (!ids.every((id) => typeof id === "string" && id)) {
        throw new AppError("Invalid worker id", 400);
    }
    const unique = new Set(ids as string[]);
    if (unique.size !== ids.length) {
        throw new AppError("Duplicate worker ids", 400);
    }
    return [...unique];
}

function serialize(p: any) {
    if (!p) return null;
    return {
        paidAt: p.paidAt,
        amountPaid: p.amountPaid,
        hoursPaid: p.hoursPaid,
        periodStart: p.periodStart,
        periodEnd: p.periodEnd,
    };
}

// PUT /api/admin/reports/payroll/paid — mark (or re-time) a set of workers as paid for one cycle.
// Body: { startDate, endDate, paidAt, workers: [{ workerId, amountPaid, hoursPaid }] }
export async function PUT(request: NextRequest) {
    try {
        const admin = await requireAuth(request, ["ADMIN"]);
        const body = await request.json();
        const { periodStart, periodEnd } = parsePeriod(body);

        const paidAt = new Date(body.paidAt);
        if (!body.paidAt || isNaN(paidAt.getTime())) {
            throw new AppError("paidAt must be a valid date and time", 400);
        }
        if (paidAt.getTime() > Date.now() + FUTURE_GRACE_MS) {
            throw new AppError("Paid date and time cannot be in the future", 400);
        }

        const entries: any[] = Array.isArray(body.workers) ? body.workers : [];
        const workerIds = parseWorkerIds(entries.map((w) => w?.workerId));
        const rows = entries.map((w) => {
            const amountPaid = Number(w.amountPaid);
            const hoursPaid = Number(w.hoursPaid);
            if (!Number.isFinite(amountPaid) || amountPaid < 0 || !Number.isFinite(hoursPaid) || hoursPaid < 0) {
                throw new AppError("amountPaid and hoursPaid must be non-negative numbers", 400);
            }
            return { workerId: w.workerId as string, periodStart, periodEnd, paidAt, amountPaid, hoursPaid, markedById: admin.id };
        });

        const workers = await prisma.user.findMany({ where: { id: { in: workerIds } }, select: { id: true, role: true } });
        if (workers.length !== workerIds.length) throw new AppError("One or more workers not found", 404);
        if (workers.some((w) => w.role !== "WORKER")) throw new AppError("Only workers can be marked as paid", 400);

        const saved = await prisma.$transaction(async (tx) => {
            const where = { workerId: { in: workerIds }, periodStart, periodEnd };
            const existing = await tx.payrollPayment.findMany({ where });
            const oldByWorker = new Map(existing.map((p) => [p.workerId, p]));

            // Replace-then-insert keeps this to a handful of statements regardless of list size.
            await tx.payrollPayment.deleteMany({ where });
            await tx.payrollPayment.createMany({ data: rows });
            await tx.auditLog.createMany({
                data: rows.map((r) => ({
                    actorId: admin.id,
                    action: "PAYROLL_MARKED_PAID",
                    entityType: "PayrollPayment",
                    entityId: r.workerId,
                    oldValue: oldByWorker.has(r.workerId) ? JSON.stringify(serialize(oldByWorker.get(r.workerId))) : null,
                    newValue: JSON.stringify(serialize(r)),
                })),
            });
            return tx.payrollPayment.findMany({ where });
        }, TX_OPTS);

        const payments: Record<string, any> = {};
        saved.forEach((p) => { payments[p.workerId] = serialize(p); });
        return NextResponse.json({ success: true, payments });
    } catch (error) {
        return handleApiError(error);
    }
}

// DELETE /api/admin/reports/payroll/paid — clear paid marks for a set of workers for one cycle.
// Body: { startDate, endDate, workerIds: string[] }
export async function DELETE(request: NextRequest) {
    try {
        const admin = await requireAuth(request, ["ADMIN"]);
        const body = await request.json();
        const { periodStart, periodEnd } = parsePeriod(body);
        const workerIds = parseWorkerIds(body.workerIds);

        const removed = await prisma.$transaction(async (tx) => {
            const where = { workerId: { in: workerIds }, periodStart, periodEnd };
            const existing = await tx.payrollPayment.findMany({ where });
            if (existing.length === 0) return 0;
            await tx.payrollPayment.deleteMany({ where });
            await tx.auditLog.createMany({
                data: existing.map((p) => ({
                    actorId: admin.id,
                    action: "PAYROLL_UNMARKED_PAID",
                    entityType: "PayrollPayment",
                    entityId: p.workerId,
                    oldValue: JSON.stringify(serialize(p)),
                    newValue: null,
                })),
            });
            return existing.length;
        }, TX_OPTS);

        return NextResponse.json(removed ? { success: true, removed } : { success: true, removed: 0, noop: true });
    } catch (error) {
        return handleApiError(error);
    }
}
