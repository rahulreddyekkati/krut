import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/jobs - List all jobs with filters
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const requester = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!requester || (requester.role !== "ADMIN" && requester.role !== "MARKET_MANAGER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const storeId = searchParams.get("storeId");
        const marketId = searchParams.get("marketId");
        const status = searchParams.get("status");

        const where: any = {};
        if (storeId) where.storeId = storeId;
        if (marketId) where.marketId = marketId;
        if (status) where.status = status;

        if (requester.role === "MARKET_MANAGER") {
            where.marketId = requester.managedMarketId;
        }

        const jobs = await prisma.job.findMany({
            where,
            include: {
                store: { select: { name: true, address: true } },
                market: { select: { name: true } },
                assignments: {
                    include: {
                        worker: { select: { id: true, name: true, email: true } }
                    }
                },
                _count: { select: { assignments: true } }
            },
            orderBy: { startTimeStr: "asc" }
        });

        return NextResponse.json(jobs);
    } catch (error) {
        console.error("GET Jobs error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/jobs - Create a new job (time-only, no date)
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const requester = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!requester || (requester.role !== "ADMIN" && requester.role !== "MARKET_MANAGER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, storeId, startTime, endTime, bonus, date } = body;

        if (!title || !storeId || !startTime || !endTime) {
            return NextResponse.json({ error: "Missing required fields: title, storeId, startTime, endTime" }, { status: 400 });
        }

        // Get marketId from store
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { marketId: true }
        });

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 400 });
        }

        // Scope check for Market Manager
        if (requester.role === "MARKET_MANAGER" && store.marketId !== requester.managedMarketId) {
            return NextResponse.json({ error: "Unauthorized: Store outside your market" }, { status: 403 });
        }

        const job = await prisma.job.create({
            data: {
                title,
                storeId,
                marketId: store.marketId,
                startTimeStr: startTime,
                endTimeStr: endTime,
                bonus: parseFloat(bonus || 0),
                creatorId: session.user.id,
                status: "OPEN",
                date: date ? new Date(date) : null
            }
        });

        return NextResponse.json(job);

    } catch (error) {
        console.error("POST Job error:", error);
        if ((error as any).code === "P2002") {
            return NextResponse.json({ error: "A job with this name already exists. Job names must be unique." }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
