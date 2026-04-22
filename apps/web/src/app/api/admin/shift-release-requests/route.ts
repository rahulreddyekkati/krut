import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { resolveTimezone, localTimeToUTC, toLocalDateStr } from "@/lib/timezone";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { role, id } = session.user;

        // Base query to get PENDING release requests
        let whereClause: any = {
            status: "PENDING"
        };

        // Filter by role
        if (role === "ADMIN") {
            // Admins see all
        } else if (role === "MARKET_MANAGER") {
            // Market Managers see requests for stores in their managed market
            const user = await prisma.user.findUnique({
                where: { id },
                select: { managedMarketId: true }
            });
            if (!user || !user.managedMarketId) {
                return NextResponse.json([]);
            }
            whereClause.job = {
                marketId: user.managedMarketId
            };
        } else {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const requests = await prisma.releaseRequest.findMany({
            where: whereClause,
            include: {
                worker: { select: { name: true } },
                job: {
                    include: {
                        store: { select: { name: true } },
                        market: { select: { name: true } }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        // Auto-reject requests where the shift is now < 2 hours away
        const now = Date.now();
        const tz = resolveTimezone(request);
        const validRequests: typeof requests = [];

        for (const req of requests) {
            if (req.date && req.job.startTimeStr) {
                const dateStr = toLocalDateStr(new Date(req.date), tz);
                const shiftStart = localTimeToUTC(dateStr, req.job.startTimeStr, tz);
                const diffMs = shiftStart.getTime() - now;

                if (diffMs < 2 * 60 * 60 * 1000) {
                    // Auto-reject this expired request
                    await prisma.releaseRequest.update({
                        where: { id: req.id },
                        data: { status: "DENIED" }
                    });
                    continue; // Skip adding to list
                }
            }
            validRequests.push(req);
        }

        return NextResponse.json(validRequests);
    } catch (error) {
        console.error("Shift release requests GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
