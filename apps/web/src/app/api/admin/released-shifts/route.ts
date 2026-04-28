import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !["ADMIN", "MARKET_MANAGER"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const isMM = session.user.role === "MARKET_MANAGER";
        const requester = isMM
            ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { managedMarketId: true } })
            : null;

        const assignments = await prisma.jobAssignment.findMany({
            where: {
                status: "AVAILABLE",
                ...(isMM && requester?.managedMarketId
                    ? { job: { marketId: requester.managedMarketId } }
                    : {})
            },
            include: {
                worker: { select: { id: true, name: true } },
                job: {
                    include: {
                        store: { select: { name: true } },
                        market: { select: { name: true, id: true } }
                    }
                }
            },
            orderBy: { date: "asc" }
        });

        return NextResponse.json(assignments);
    } catch (error) {
        console.error("Get released shifts error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
