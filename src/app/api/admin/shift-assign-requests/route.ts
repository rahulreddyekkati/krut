import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { role, id } = session.user;

        // Base query to get PENDING shift requests (assign requests)
        let whereClause: any = {
            status: "PENDING"
        };

        // Filter by role
        if (role === "ADMIN") {
            // Admins see all
        } else if (role === "MARKET_MANAGER") {
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

        const requests = await prisma.shiftRequest.findMany({
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

        // Auto-reject requests where the shift is now in the past
        const now = new Date();
        const validRequests: any[] = [];

        for (const req of requests) {
            const shiftDate = req.date ? new Date(req.date) : null;
            if (shiftDate && req.job.startTimeStr) {
                const [h, m] = req.job.startTimeStr.split(':').map(Number);
                const shiftStart = new Date(shiftDate);
                shiftStart.setHours(h, m, 0, 0);
                
                if (now > shiftStart) {
                    await prisma.shiftRequest.update({
                        where: { id: req.id },
                        data: { status: "DENIED" }
                    });
                    continue;
                }
            }
            validRequests.push(req);
        }

        return NextResponse.json(validRequests);
    } catch (error) {
        console.error("Shift assign requests GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
