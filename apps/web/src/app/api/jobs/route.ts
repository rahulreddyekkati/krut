import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";
import { jobSchema } from "@/lib/validate";

// GET /api/jobs - List all jobs with filters
export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);

        const { searchParams } = new URL(request.url);
        const storeId = searchParams.get("storeId");
        const marketId = searchParams.get("marketId");
        const status = searchParams.get("status");

        const where: any = {};
        if (storeId) where.storeId = storeId;
        if (marketId) where.marketId = marketId;
        if (status) where.status = status;

        if (user.role === "MARKET_MANAGER") {
            where.marketId = user.managedMarketId;
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
        return handleApiError(error);
    }
}

// POST /api/jobs - Create a new job (time-only, no date)
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);

        const body = await request.json();
        const { title, storeId, startTime, endTime, bonus, date } = jobSchema.parse({
            ...body,
            bonus: body.bonus !== undefined ? Number(body.bonus) : 0,
        });

        // Get marketId from store
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { marketId: true }
        });

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 400 });
        }

        // Scope check for Market Manager
        if (user.role === "MARKET_MANAGER" && store.marketId !== user.managedMarketId) {
            return NextResponse.json({ error: "Unauthorized: Store outside your market" }, { status: 403 });
        }

        const job = await prisma.job.create({
            data: {
                title,
                storeId,
                marketId: store.marketId,
                startTimeStr: startTime,
                endTimeStr: endTime,
                bonus: bonus ?? 0,
                creatorId: user.id,
                status: "OPEN",
                date: date ? new Date(date) : null
            }
        });

        return NextResponse.json(job);

    } catch (error) {
        return handleApiError(error);
    }
}
