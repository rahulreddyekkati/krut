import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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

        const isMM = requester.role === "MARKET_MANAGER";
        const marketId = requester.managedMarketId;

        // Parse optional date filter
        const dateParam = request.nextUrl.searchParams.get("date");
        let dateFilter: any = {};
        if (dateParam) {
            const startStr = `${dateParam}T00:00:00Z`;
            const endStr = `${dateParam}T23:59:59Z`;
            dateFilter = {
                OR: [
                    { date: { gte: new Date(startStr), lte: new Date(endStr) } },
                    {
                        assignments: {
                            some: {
                                OR: [
                                    { date: { gte: new Date(startStr), lte: new Date(endStr) } },
                                    { isRecurring: true }
                                ]
                            }
                        }
                    }
                ]
            };
        }

        if (isMM && !marketId) {
            return NextResponse.json({ totalJobs: 0, activeWorkers: 0, pendingRecaps: 0 });
        }

        let whereJob: any = {};
        if (isMM) {
            whereJob = { store: { marketId } };
        }

        const totalJobs = await prisma.job.count({ where: { ...whereJob, ...dateFilter } });

        // Active Workers: Workers with active clock-ins in the scoped jobs
        const activeWorkers = await prisma.jobAssignment.count({
            where: {
                job: whereJob,
                clockIn: { not: null },
                clockOut: null,
                ...(dateParam ? { clockIn: { gte: new Date(dateParam + "T00:00:00"), not: null } } : {})
            }
        });

        // Pending Recaps: Assignments where the worker clocked out but hasn't submitted a recap
        let assignmentDateFilter: any = {};
        if (dateParam) {
            const startStr = `${dateParam}T00:00:00Z`;
            const endStr = `${dateParam}T23:59:59Z`;
            assignmentDateFilter = {
                OR: [
                    { date: { gte: new Date(startStr), lte: new Date(endStr) } },
                    { isRecurring: true },
                    { job: { date: { gte: new Date(startStr), lte: new Date(endStr) } } }
                ]
            };
        }

        const pendingRecaps = await prisma.jobAssignment.count({
            where: {
                job: whereJob,
                status: "RECAP_PENDING",
                OR: [
                    { recap: { is: null } },
                    { recap: { status: "REJECTED" } }
                ],
                ...assignmentDateFilter
            }
        });

        return NextResponse.json({
            totalJobs,
            activeWorkers,
            pendingRecaps
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
