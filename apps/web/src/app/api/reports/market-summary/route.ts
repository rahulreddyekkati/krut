import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const requester = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!requester || requester.role !== "MARKET_MANAGER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const marketId = requester.managedMarketId;
        if (!marketId) {
            return NextResponse.json({ totalStores: 0, totalWorkers: 0, jobsToday: 0, activeShifts: 0 });
        }

        const storesCount = await prisma.store.count({ where: { marketId } });
        const workersCount = await prisma.user.count({
            where: {
                marketId: marketId
            }
        });

        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const endOfToday = new Date(now.setHours(23, 59, 59, 999));

        const jobsToday = await prisma.job.count({
            where: {
                store: { marketId },
                date: { gte: startOfToday, lte: endOfToday }
            }
        });

        const activeShifts = await prisma.jobAssignment.count({
            where: {
                job: { store: { marketId } },
                clockIn: { not: null },
                clockOut: null
            }
        });

        return NextResponse.json({
            totalStores: storesCount,
            totalWorkers: workersCount,
            jobsToday,
            activeShifts
        });
    } catch (error) {
        console.error("Market summary error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
