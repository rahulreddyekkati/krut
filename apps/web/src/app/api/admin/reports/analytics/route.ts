import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Fetch all approved recaps in the range
        const recaps = await prisma.recap.findMany({
            where: {
                status: "APPROVED",
                createdAt: { gte: start, lte: end }
            },
            include: {
                job: {
                    include: {
                        store: { select: { name: true, id: true } },
                        market: { select: { name: true, id: true } }
                    }
                },
                skus: true
            }
        });

        // Aggregations
        let totalSales = 0;
        let totalCustomers = 0;
        let totalReimb = 0;
        const salesByStore: Record<string, { name: string, sales: number }> = {};
        const skusSold: Record<string, number> = {};
        const dailyData: Record<string, { date: string, sales: number, customers: number }> = {};

        recaps.forEach(recap => {
            totalSales += recap.receiptTotal;
            totalCustomers += recap.consumersSampled;
            totalReimb += recap.reimbursement;

            // Store performance
            const storeId = recap.job.storeId;
            if (!salesByStore[storeId]) {
                salesByStore[storeId] = { name: recap.job.store.name, sales: 0 };
            }
            salesByStore[storeId].sales += recap.receiptTotal;

            // SKU data
            recap.skus.forEach(sku => {
                skusSold[sku.skuName] = (skusSold[sku.skuName] || 0) + sku.bottlesSold;
            });

            // Daily trend
            const dateKey = recap.createdAt.toISOString().split('T')[0];
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = { date: dateKey, sales: 0, customers: 0 };
            }
            dailyData[dateKey].sales += recap.receiptTotal;
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
