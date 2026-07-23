import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";

/**
 * GET /api/admin/reports/brand-spend
 *
 * Returns total payroll cost (worked hours * pay rate + bonus + approved-recap
 * reimbursement) for shifts in the requested date range, broken down by the
 * per-shift brandAllocation tag ("KRUTO" | "MULUK" | "BOTH" | unallocated).
 * Same per-shift cost formula as /api/admin/reports/payroll.
 *
 * Query params: startDate, endDate (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
    try {
        await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        if (!startDate || !endDate) {
            return NextResponse.json({ error: "startDate and endDate required" }, { status: 400 });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const assignments = await prisma.jobAssignment.findMany({
            where: {
                clockIn: { not: null },
                date: { gte: start, lte: end }
            },
            include: {
                job: { select: { bonus: true } },
                worker: { select: { hourlyWage: true } },
                recap: { select: { status: true, reimbursement: true } }
            } as any
        });

        let total = 0;
        let kruto = 0;
        let muluk = 0;
        let both = 0;

        for (const assignment of assignments as any[]) {
            const hourlyWage = assignment.worker?.hourlyWage || 0;
            const workedHours = assignment.workedHours || 0;
            let cost = workedHours * hourlyWage;
            cost += assignment.bonus || 0;
            cost += assignment.job?.bonus || 0;
            if (assignment.recap?.status === "APPROVED") {
                cost += assignment.recap.reimbursement || 0;
            }

            total += cost;
            if (assignment.brandAllocation === "KRUTO") kruto += cost;
            else if (assignment.brandAllocation === "MULUK") muluk += cost;
            else if (assignment.brandAllocation === "BOTH") both += cost;
        }

        return NextResponse.json({
            total: parseFloat(total.toFixed(2)),
            kruto: parseFloat(kruto.toFixed(2)),
            muluk: parseFloat(muluk.toFixed(2)),
            both: parseFloat(both.toFixed(2))
        });
    } catch (error) {
        return handleApiError(error);
    }
}
