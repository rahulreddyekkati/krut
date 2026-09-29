import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";
import { localTimeToUTC } from "@/lib/timezone";
import {
    buildDateMarkerRange,
    buildCycleAssignmentWhere,
    assignmentBelongsToCyclePreciseCheck,
    shiftDayKey,
} from "@/lib/payroll";

/**
 * GET /api/admin/reports/worker-performance
 *
 * Returns per-worker recap analytics for the requested date range:
 *  - performance metrics (customers, bottles sold, reimbursement per shift)
 *  - fraud risk flags (no bottles sold, missing receipts, no manager signature)
 *
 * "Sold" is the sum of the Inventory Tracking Sold column (RecapSku.bottlesSold),
 * never receiptTotal — the receipt is what the worker spent, not what they sold.
 *  - trend across shifts so admin can see improvement or decline
 *
 * Query params: startDate, endDate (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        if (!startDate || !endDate) {
            return NextResponse.json({ error: "startDate and endDate required" }, { status: 400 });
        }

        const marketId = user.managedMarketId || user.marketId;
        const marketFilter = user.role === "MARKET_MANAGER" ? { store: { marketId: marketId ?? undefined } } : {};

        // Attribute each recap to its SHIFT's day, not the day it was submitted — same range
        // logic as analytics/brand-spend/payroll (see lib/payroll.ts).
        const dateMarkerRange = buildDateMarkerRange(startDate, endDate);
        const DEFAULT_TZ = "America/Chicago";
        const PAD_MS = 3 * 60 * 60 * 1000;
        const paddedRealStart = new Date(localTimeToUTC(startDate, "00:00", DEFAULT_TZ).getTime() - PAD_MS);
        const paddedRealEnd = new Date(localTimeToUTC(endDate, "23:59", DEFAULT_TZ).getTime() + PAD_MS);

        const candidates = await prisma.recap.findMany({
            where: {
                status: "APPROVED",
                assignment: buildCycleAssignmentWhere(dateMarkerRange, paddedRealStart, paddedRealEnd),
                job: marketFilter,
            },
            include: {
                job: { include: { store: { select: { name: true, timezone: true } } } },
                assignment: { include: { worker: { select: { id: true, name: true, email: true } } } },
                skus: true,
            },
        }) as any[];

        // Precise per-store re-check of the padded window; drop anything whose shift day falls
        // outside the range so the filter and the per-shift dates always agree.
        const recaps = candidates.flatMap(recap => {
            const tz = recap.job?.store?.timezone || DEFAULT_TZ;
            if (!assignmentBelongsToCyclePreciseCheck(recap.assignment, localTimeToUTC(startDate, "00:00", tz), localTimeToUTC(endDate, "23:59", tz))) return [];
            const dateKey = shiftDayKey(recap.assignment, recap.createdAt, tz);
            if (dateKey < startDate || dateKey > endDate) return [];
            return [{ ...recap, dateKey }];
        });

        // Build per-worker stats
        const workerMap: Record<string, {
            workerId: string;
            workerName: string;
            workerEmail: string;
            shifts: number;
            totalCustomersSampled: number;
            totalBottlesSold: number;
            totalReimbursement: number;
            rushLevels: string[];
            missingReceiptCount: number;      // no receipt photo uploaded
            managerUnavailableCount: number;   // manager signature missing
            zeroSoldCount: number;             // 0 bottles sold, no reimb claimed
            zeroSoldWithReimbCount: number;    // 0 bottles sold but claimed reimb
            recentShifts: {
                date: string;
                store: string;
                customersSampled: number;
                bottlesSold: number;
                reimbursement: number;
                rushLevel: string;
                hasReceipt: boolean;
                hasManagerSig: boolean;
                flags: string[];
            }[];
        }> = {};

        for (const recap of recaps) {
            const worker = recap.assignment?.worker;
            if (!worker) continue;

            if (!workerMap[worker.id]) {
                workerMap[worker.id] = {
                    workerId: worker.id,
                    workerName: worker.name,
                    workerEmail: worker.email,
                    shifts: 0,
                    totalCustomersSampled: 0,
                    totalBottlesSold: 0,
                    totalReimbursement: 0,
                    rushLevels: [],
                    missingReceiptCount: 0,
                    managerUnavailableCount: 0,
                    zeroSoldCount: 0,
                    zeroSoldWithReimbCount: 0,
                    recentShifts: [],
                };
            }

            const bottlesSold = (recap.skus || []).reduce((sum: number, s: any) => sum + (s.bottlesSold || 0), 0);

            const w = workerMap[worker.id];
            w.shifts++;
            w.totalCustomersSampled += recap.consumersSampled ?? 0;
            w.totalBottlesSold += bottlesSold;
            w.totalReimbursement += recap.reimbursement ?? 0;
            if (recap.rushLevel) w.rushLevels.push(recap.rushLevel);

            // Fraud / quality flags for this shift
            const hasReceipt = !!(recap.receiptUrl && recap.receiptUrl !== "[]" && recap.receiptUrl !== "null");
            const hasManagerSig = !!(recap.managerSignature);
            const reimb = recap.reimbursement ?? 0;

            const shiftFlags: string[] = [];
            if (!hasReceipt) { w.missingReceiptCount++; shiftFlags.push("No receipt"); }
            if (!hasManagerSig) { w.managerUnavailableCount++; shiftFlags.push("No manager sig"); }
            if (bottlesSold === 0) {
                if (reimb > 0) { w.zeroSoldWithReimbCount++; shiftFlags.push("Reimb with 0 bottles sold"); }
                else { w.zeroSoldCount++; shiftFlags.push("0 bottles sold"); }
            }

            w.recentShifts.push({
                date: recap.dateKey,
                store: recap.job?.store?.name ?? "—",
                customersSampled: recap.consumersSampled ?? 0,
                bottlesSold,
                reimbursement: reimb,
                rushLevel: recap.rushLevel ?? "—",
                hasReceipt,
                hasManagerSig,
                flags: shiftFlags,
            });
        }

        // Compute derived metrics and risk score
        const workers = Object.values(workerMap).map(w => {
            const avgCustomers = w.shifts > 0 ? +(w.totalCustomersSampled / w.shifts).toFixed(1) : 0;
            const avgBottles = w.shifts > 0 ? +(w.totalBottlesSold / w.shifts).toFixed(1) : 0;
            const avgReimb = w.shifts > 0 ? +(w.totalReimbursement / w.shifts).toFixed(2) : 0;

            // Risk score 0–100: each flag type adds points
            let riskScore = 0;
            if (w.shifts > 0) {
                riskScore += Math.round((w.missingReceiptCount / w.shifts) * 25);
                riskScore += Math.round((w.managerUnavailableCount / w.shifts) * 20);
                riskScore += Math.round((w.zeroSoldWithReimbCount / w.shifts) * 35);
                riskScore += Math.round((w.zeroSoldCount / w.shifts) * 20);
            }
            riskScore = Math.min(riskScore, 100);

            // Most common rush level
            const rushFreq: Record<string, number> = {};
            w.rushLevels.forEach(r => { rushFreq[r] = (rushFreq[r] || 0) + 1; });
            const typicalRush = Object.entries(rushFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

            return {
                workerId: w.workerId,
                workerName: w.workerName,
                workerEmail: w.workerEmail,
                shifts: w.shifts,
                avgCustomersSampled: avgCustomers,
                avgBottlesSold: avgBottles,
                totalBottlesSold: w.totalBottlesSold,
                avgReimbursement: avgReimb,
                totalReimbursement: +w.totalReimbursement.toFixed(2),
                typicalRushLevel: typicalRush,
                riskScore,
                flags: {
                    missingReceiptCount: w.missingReceiptCount,
                    managerUnavailableCount: w.managerUnavailableCount,
                    zeroSoldCount: w.zeroSoldCount,
                    zeroSoldWithReimbCount: w.zeroSoldWithReimbCount,
                },
                recentShifts: w.recentShifts.slice(-10), // last 10
            };
        });

        // Sort by risk score descending so highest-risk workers appear first
        workers.sort((a, b) => b.riskScore - a.riskScore);

        return NextResponse.json({ workers, total: workers.length });
    } catch (error) {
        return handleApiError(error);
    }
}
