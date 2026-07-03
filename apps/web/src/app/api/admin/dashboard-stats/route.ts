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

        let totalJobs = 0;
        if (dateParam) {
            const jobs = await prisma.job.findMany({
                where: { ...whereJob, ...dateFilter },
                include: {
                    assignments: {
                        where: {
                            OR: [
                                { date: { gte: new Date(dateParam + "T00:00:00Z"), lte: new Date(dateParam + "T23:59:59Z") } },
                                { isRecurring: true }
                            ]
                        }
                    }
                }
            });

            const dayStart = new Date(`${dateParam}T00:00:00Z`);
            const dayEnd   = new Date(`${dateParam}T23:59:59Z`);
            const dayOfWeek = dayStart.getUTCDay();

            const flat = jobs.flatMap((job: any) => {
                const allAssignments = job.assignments as any[];

                if (allAssignments.length === 0) {
                    return [job]; // Genuinely open job
                }

                const relevant = allAssignments.filter((a: any) => {
                    if (!a.date) return false;
                    const d = new Date(a.date);
                    if (d >= dayStart && d <= dayEnd) return true;
                    if (a.isRecurring && d.getUTCDay() === dayOfWeek) return true;
                    return false;
                });

                const seen = new Set<string>();
                const assignments = relevant.filter((a: any) => {
                    const key = a.workerId || a.id;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });

                if (assignments.length === 0) return [];
                return assignments;
            });

            totalJobs = flat.length;
        } else {
            totalJobs = await prisma.job.count({ where: whereJob });
        }

        // Active Workers: anyone currently clocked in (no clock-out yet), regardless of date
        const activeWorkers = await prisma.jobAssignment.count({
            where: {
                job: whereJob,
                status: "IN_PROGRESS"
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

        const pendingRecapAssignments = await prisma.jobAssignment.findMany({
            where: { job: whereJob, status: "RECAP_PENDING", ...assignmentDateFilter },
            select: { id: true, recap: { select: { status: true } } }
        });
        const pendingRecaps = pendingRecapAssignments.filter(
            (a: any) => !a.recap || a.recap.status === "REJECTED"
        ).length;

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
