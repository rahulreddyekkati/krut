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
        const type = request.nextUrl.searchParams.get("type"); // "jobs" | "active" | "recaps"
        const dateParam = request.nextUrl.searchParams.get("date");

        let whereJob: any = {};
        if (isMM) {
            whereJob = { store: { marketId } };
        }

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

        if (type === "jobs") {
            // Total Jobs: show each job with store name, start/end time, market, assigned worker
            const jobs = await prisma.job.findMany({
                where: { ...whereJob, ...dateFilter },
                include: {
                    store: {
                        include: {
                            market: { select: { name: true } }
                        }
                    },
                    assignments: {
                        include: {
                            worker: { select: { name: true } }
                        },
                        where: dateParam ? {
                            OR: [
                                { date: { gte: new Date(dateParam + "T00:00:00"), lte: new Date(dateParam + "T23:59:59") } },
                                { isRecurring: true }
                            ]
                        } : {}
                    }
                },
                orderBy: { createdAt: "desc" }
            });

            const data = jobs.map((job: any) => ({
                id: job.id,
                storeName: job.store.name,
                startTime: job.startTimeStr || "--",
                endTime: job.endTimeStr || "--",
                marketName: job.store.market?.name || "—",
                assignedWorker: [...new Set(job.assignments.map((a: any) => a.worker?.name).filter(Boolean))].join(", ") || "Unassigned"
            }));

            return NextResponse.json({ data });
        }

        if (type === "active") {
            // Active Workers: clocked in, not clocked out
            const assignments = await prisma.jobAssignment.findMany({
                where: {
                    job: whereJob,
                    status: "IN_PROGRESS"
                },
                include: {
                    worker: { select: { name: true } },
                    job: {
                        include: {
                            store: {
                                include: { market: { select: { name: true } } }
                            }
                        }
                    }
                }
            });

            const data = assignments.map((a: any) => ({
                id: a.id,
                workerName: a.worker?.name || "Unknown",
                storeName: a.job.store.name,
                marketName: a.job.store.market?.name || "—",
                clockIn: a.clockIn,
                shiftEnd: a.job.endTimeStr || "--"
            }));

            return NextResponse.json({ data });
        }

        if (type === "recaps") {
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

            const assignments = await prisma.jobAssignment.findMany({
                where: {
                    job: whereJob,
                    status: "RECAP_PENDING",
                    OR: [
                        { recap: { is: null } },
                        { recap: { status: "REJECTED" } }
                    ],
                    ...assignmentDateFilter
                },
                include: {
                    worker: { select: { id: true, name: true } },
                    job: {
                        include: {
                            store: { include: { market: { select: { name: true } } } }
                        }
                    }
                }
            });

            const data = assignments.map((a: any) => ({
                id: a.id,
                jobId: a.job.id,
                workerId: a.worker?.id,
                workerName: a.worker?.name || "Unknown",
                storeName: a.job.store.name,
                marketName: a.job.store.market?.name || "—",
                clockIn: a.clockIn,
                clockOut: a.clockOut
            }));

            return NextResponse.json({ data });
        }

        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    } catch (error) {
        console.error("Dashboard details error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
