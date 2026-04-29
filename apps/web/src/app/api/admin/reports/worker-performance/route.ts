import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";

/**
 * GET /api/admin/reports/worker-performance
 *
 * Returns per-worker recap analytics for the requested date range:
 *  - performance metrics (customers, sales, reimbursement per shift)
 *  - fraud risk flags (high reimb/low sales, missing receipts, no manager signature)
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

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const marketFilter = user.role === "MARKET_MANAGER" ? { store: { marketId: user.managedMarketId ?? undefined } } : {};

        // Fetch all approved recaps in range with full context
        const recaps = await prisma.recap.findMany({
            where: {
                status: "APPROVED",
                createdAt: { gte: start, lte: end },
                job: marketFilter,
            },
            include: {
                job: { include: { store: { select: { name: true } } } },
                assignment: { include: { worker: { select: { id: true, name: true, email: true } } } },
                skus: true,
            },
        }) as any[];

        // Build per-worker stats
        const workerMap: Record<string, {
            workerId: string;
            workerName: string;
            workerEmail: string;
            shifts: number;
            totalCustomersSampled: number;
            totalReceiptSales: number;
            totalReimbursement: number;
            rushLevels: string[];
            missingReceiptCount: number;      // no receipt photo uploaded
            managerUnavailableCount: number;   // manager signature missing
            highReimbLowSalesCount: number;    // reimb > sales on same shift
            zeroSalesWithReimbCount: number;   // $0 sales but claimed reimb
            recentShifts: {
                date: string;
                store: string;
                customersSampled: number;
                receiptTotal: number;
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
                    totalReceiptSales: 0,
                    totalReimbursement: 0,
                    rushLevels: [],
                    missingReceiptCount: 0,
                    managerUnavailableCount: 0,
                    highReimbLowSalesCount: 0,
                    zeroSalesWithReimbCount: 0,
                    recentShifts: [],
                };
            }

            const w = workerMap[worker.id];
            w.shifts++;
            w.totalCustomersSampled += recap.consumersSampled ?? 0;
            w.totalReceiptSales += recap.receiptTotal ?? 0;
            w.totalReimbursement += recap.reimbursement ?? 0;
            if (recap.rushLevel) w.rushLevels.push(recap.rushLevel);

            // Fraud / quality flags for this shift
            const hasReceipt = !!(recap.receiptUrl && recap.receiptUrl !== "[]" && recap.receiptUrl !== "null");
            const hasManagerSig = !!(recap.managerSignature);
            const reimb = recap.reimbursement ?? 0;
            const sales = recap.receiptTotal ?? 0;

            const shiftFlags: string[] = [];
            if (!hasReceipt) { w.missingReceiptCount++; shiftFlags.push("No receipt"); }
            if (!hasManagerSig) { w.managerUnavailableCount++; shiftFlags.push("No manager sig"); }
            if (reimb > 0 && sales === 0) { w.zeroSalesWithReimbCount++; shiftFlags.push("Reimb with $0 sales"); }
            if (reimb > sales && sales > 0) { w.highReimbLowSalesCount++; shiftFlags.push("Reimb > sales"); }

            // SKU sanity: sold > beginning + purchased is physically impossible
            for (const sku of recap.skus ?? []) {
                const maxSellable = (sku.beginningInventory ?? 0) + (sku.purchased ?? 0);
                if (sku.bottlesSold > maxSellable) {
                    shiftFlags.push(`${sku.skuName}: sold ${sku.bottlesSold} but only had ${maxSellable}`);
                }
            }

            w.recentShifts.push({
                date: recap.createdAt.toISOString().split("T")[0],
                store: recap.job?.store?.name ?? "—",
                customersSampled: recap.consumersSampled ?? 0,
                receiptTotal: sales,
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
            const avgSales = w.shifts > 0 ? +(w.totalReceiptSales / w.shifts).toFixed(2) : 0;
            const avgReimb = w.shifts > 0 ? +(w.totalReimbursement / w.shifts).toFixed(2) : 0;

            // Risk score 0–100: each flag type adds points
            let riskScore = 0;
            if (w.shifts > 0) {
                riskScore += Math.round((w.missingReceiptCount / w.shifts) * 25);
                riskScore += Math.round((w.managerUnavailableCount / w.shifts) * 20);
                riskScore += Math.round((w.zeroSalesWithReimbCount / w.shifts) * 35);
                riskScore += Math.round((w.highReimbLowSalesCount / w.shifts) * 20);
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
                avgReceiptSales: avgSales,
                avgReimbursement: avgReimb,
                totalReimbursement: +w.totalReimbursement.toFixed(2),
                typicalRushLevel: typicalRush,
                riskScore,
                flags: {
                    missingReceiptCount: w.missingReceiptCount,
                    managerUnavailableCount: w.managerUnavailableCount,
                    highReimbLowSalesCount: w.highReimbLowSalesCount,
                    zeroSalesWithReimbCount: w.zeroSalesWithReimbCount,
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
