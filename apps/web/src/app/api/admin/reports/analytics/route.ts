import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { localTimeToUTC } from "@/lib/timezone";
import {
    buildDateMarkerRange,
    buildCycleAssignmentWhere,
    assignmentBelongsToCyclePreciseCheck,
    shiftDayKey,
} from "@/lib/payroll";

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKET_MANAGER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        if (!startDate || !endDate) {
            return NextResponse.json({ error: "Missing date range" }, { status: 400 });
        }

        // Recaps are attributed to the SHIFT's day, not the day they were submitted — same range
        // logic as brand-spend/payroll (see lib/payroll.ts). Previously this filtered on
        // createdAt with `end.setHours(23,59,59,999)` on a UTC server and bucketed by the UTC
        // day, so evening recaps landed on the next day and dropped out of the range.
        const dateMarkerRange = buildDateMarkerRange(startDate, endDate);
        const DEFAULT_TZ = "America/Chicago";
        const PAD_MS = 3 * 60 * 60 * 1000;
        const paddedRealStart = new Date(localTimeToUTC(startDate, "00:00", DEFAULT_TZ).getTime() - PAD_MS);
        const paddedRealEnd = new Date(localTimeToUTC(endDate, "23:59", DEFAULT_TZ).getTime() + PAD_MS);

        const candidates = await prisma.recap.findMany({
            where: {
                status: "APPROVED",
                assignment: buildCycleAssignmentWhere(dateMarkerRange, paddedRealStart, paddedRealEnd)
            },
            include: {
                assignment: { select: { date: true, clockIn: true } },
                job: {
                    include: {
                        store: { select: { name: true, id: true, timezone: true } },
                        market: { select: { name: true, id: true } }
                    }
                },
                skus: true
            }
        });

        // Precise per-market re-check of the padded window, then key each recap by its shift day
        // and drop any whose day falls outside the range, so the filter and buckets always agree.
        const recaps = candidates.flatMap(recap => {
            const tz = recap.job.store?.timezone || DEFAULT_TZ;
            if (!assignmentBelongsToCyclePreciseCheck(recap.assignment, localTimeToUTC(startDate, "00:00", tz), localTimeToUTC(endDate, "23:59", tz))) return [];
            const dateKey = shiftDayKey(recap.assignment, recap.createdAt, tz);
            if (dateKey < startDate || dateKey > endDate) return [];
            return [{ ...recap, dateKey }];
        });

        // Aggregations
        let totalSales = 0;
        let totalCustomers = 0;
        let totalReimb = 0;
        const salesByStore: Record<string, { name: string, sales: number }> = {};
        const skusSold: Record<string, number> = {};
        const dailyData: Record<string, { date: string, sales: number, customers: number }> = {};

        // "Sales" = bottles from the Inventory Tracking Sold column, not receiptTotal
        // (the receipt is what the worker spent, not what they sold).
        recaps.forEach(recap => {
            const bottlesSold = recap.skus.reduce((sum, s) => sum + (s.bottlesSold || 0), 0);
            totalSales += bottlesSold;
            totalCustomers += recap.consumersSampled;
            totalReimb += recap.reimbursement;

            // Store performance
            const storeId = recap.job.storeId;
            if (!salesByStore[storeId]) {
                salesByStore[storeId] = { name: recap.job.store.name, sales: 0 };
            }
            salesByStore[storeId].sales += bottlesSold;

            // SKU data
            recap.skus.forEach(sku => {
                skusSold[sku.skuName] = (skusSold[sku.skuName] || 0) + sku.bottlesSold;
            });

            // Daily trend
            const dateKey = recap.dateKey;
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = { date: dateKey, sales: 0, customers: 0 };
            }
            dailyData[dateKey].sales += bottlesSold;
            dailyData[dateKey].customers += recap.consumersSampled;
        });

        const topStores = Object.values(salesByStore)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        const topSkus = Object.entries(skusSold)
            .map(([name, sold]) => ({ name, sold }))
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 5);

        const trend = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json({
            summary: {
                totalSales,
                totalCustomers,
                totalReimb,
                count: recaps.length
            },
            topStores,
            topSkus,
            trend
        });
    } catch (error) {
        console.error("Analytics API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
