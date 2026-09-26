import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { isCanonicalCycle } from "@/lib/cycles";

// Allow a little clock skew between the admin's browser and the server.
const FUTURE_GRACE_MS = 5 * 60 * 1000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parsePeriod(body: any) {
    const { workerId, startDate, endDate } = body || {};
    if (!workerId || typeof workerId !== "string") {
        throw new AppError("workerId is required", 400);
    }
    if (typeof startDate !== "string" || typeof endDate !== "string" || !DATE_RE.test(startDate) || !DATE_RE.test(endDate)) {
        throw new AppError("startDate and endDate must be YYYY-MM-DD", 400);
    }
    if (startDate > endDate) {
        throw new AppError("startDate must be on or before endDate", 400);
    }
    if (!isCanonicalCycle(startDate, endDate)) {
        throw new AppError("Payments can only be recorded for a full pay cycle (1st–15th or 16th–end of month)", 400);
    }
    return { workerId, periodStart: startDate, periodEnd: endDate };
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

// PUT /api/admin/reports/payroll/paid — mark (or re-time) a worker as paid for a cycle
export async function PUT(request: NextRequest) {
    try {
        const admin = await requireAuth(request, ["ADMIN"]);
        const body = await request.json();
        const { workerId, periodStart, periodEnd } = parsePeriod(body);

        const paidAt = new Date(body.paidAt);
        if (!body.paidAt || isNaN(paidAt.getTime())) {
            throw new AppError("paidAt must be a valid date and time", 400);
        }
        if (paidAt.getTime() > Date.now() + FUTURE_GRACE_MS) {
            throw new AppError("Paid date and time cannot be in the future", 400);
        }

        const amountPaid = Number(body.amountPaid);
        const hoursPaid = Number(body.hoursPaid);
        if (!Number.isFinite(amountPaid) || amountPaid < 0 || !Number.isFinite(hoursPaid) || hoursPaid < 0) {
            throw new AppError("amountPaid and hoursPaid must be non-negative numbers", 400);
        }

        const worker = await prisma.user.findUnique({ where: { id: workerId }, select: { role: true } });
        if (!worker) throw new AppError("Worker not found", 404);
        if (worker.role !== "WORKER") throw new AppError("Only workers can be marked as paid", 400);

        const key = { workerId_periodStart_periodEnd: { workerId, periodStart, periodEnd } };
        const data = { paidAt, amountPaid, hoursPaid, markedById: admin.id };

        const payment = await prisma.$transaction(async (tx) => {
            const existing = await tx.payrollPayment.findUnique({ where: key });
            const saved = await tx.payrollPayment.upsert({
                where: key,
                create: { workerId, periodStart, periodEnd, ...data },
                update: data,
            });
            await tx.auditLog.create({
                data: {
                    actorId: admin.id,
                    action: "PAYROLL_MARKED_PAID",
                    entityType: "PayrollPayment",
                    entityId: saved.id,
                    oldValue: existing ? JSON.stringify(serialize(existing)) : null,
                    newValue: JSON.stringify(serialize(saved)),
                },
            });
            return saved;
        });

        return NextResponse.json({ success: true, payment: serialize(payment) });
    } catch (error) {
        return handleApiError(error);
    }
}

// DELETE /api/admin/reports/payroll/paid — clear a worker's paid mark for a cycle
export async function DELETE(request: NextRequest) {
    try {
        const admin = await requireAuth(request, ["ADMIN"]);
        const { workerId, periodStart, periodEnd } = parsePeriod(await request.json());
        const key = { workerId_periodStart_periodEnd: { workerId, periodStart, periodEnd } };

        const removed = await prisma.$transaction(async (tx) => {
            const existing = await tx.payrollPayment.findUnique({ where: key });
            if (!existing) return false;
            await tx.payrollPayment.delete({ where: { id: existing.id } });
            await tx.auditLog.create({
                data: {
                    actorId: admin.id,
                    action: "PAYROLL_UNMARKED_PAID",
                    entityType: "PayrollPayment",
                    entityId: existing.id,
                    oldValue: JSON.stringify(serialize(existing)),
                    newValue: null,
                },
            });
            return true;
        });

        return NextResponse.json(removed ? { success: true } : { success: true, noop: true });
    } catch (error) {
        return handleApiError(error);
    }
}
