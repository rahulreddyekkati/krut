import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { resolveTimezone, toLocalDateStr } from "@/lib/timezone";

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
        let dayOfWeek: number | null = null;
        if (dateParam) {
            const startStr = `${dateParam}T00:00:00Z`;
            const endStr = `${dateParam}T23:59:59Z`;
            dayOfWeek = new Date(startStr).getUTCDay();
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
            // "By Date" tab (Job Scheduling) opts into this via scope=upcoming: only
            // shifts from Jobs created with a specific date (Job.date != null, i.e. not a
            // recurring template) that are today-or-later. Deliberately structured as an
            // if/else-if with the existing dateParam branch below (not a blind spread) so
            // the two modes can't silently combine if a future caller ever sent both --
            // Admin Dashboard / mobile AdminDashboard always pass `date` and rely on the
            // dateParam branch including recurring-template jobs whose assignments
            // materialize on that date, which must keep working unchanged.
            const upcomingSpecificDatesOnly = request.nextUrl.searchParams.get("scope") === "upcoming";

            let jobWhere: any = { ...whereJob };
            if (upcomingSpecificDatesOnly) {
                const tz = resolveTimezone(request);
                const todayStr = toLocalDateStr(new Date(), tz);
                const todayUTCMidnight = new Date(`${todayStr}T00:00:00.000Z`);
                jobWhere.date = { not: null, gte: todayUTCMidnight };
            } else if (dateParam) {
                jobWhere = { ...jobWhere, ...dateFilter };
            }

            // Total Jobs: show each job with store name, start/end time, market, assigned worker
            const jobs = await prisma.job.findMany({
                where: jobWhere,
                include: {
                    store: {
                        include: {
                            market: { select: { id: true, name: true } }
                        }
                    },
                    assignments: {
                        include: {
                            worker: { select: { id: true, name: true } }
                        },
                        where: dateParam ? {
                            OR: [
                                { date: { gte: new Date(dateParam + "T00:00:00Z"), lte: new Date(dateParam + "T23:59:59Z") } },
                                { isRecurring: true }
                            ]
                        } : {}
                    }
                },
                orderBy: { createdAt: "desc" }
            });

            const dayStart = dateParam ? new Date(`${dateParam}T00:00:00Z`) : null;
            const dayEnd   = dateParam ? new Date(`${dateParam}T23:59:59Z`) : null;

            const data = jobs.flatMap((job: any) => {
                const allAssignments = job.assignments as any[];

                // Jobs with no assignments at all are genuinely open — show as Unassigned
                if (allAssignments.length === 0) {
                    return [{
                        id: job.id,
                        assignmentId: null,
                        workerId: null,
                        status: null,
                        requestedWorkerId: null,
                        storeName: job.store.name,
                        startTime: job.startTimeStr || "--",
                        endTime: job.endTimeStr || "--",
                        marketName: job.store.market?.name || "—",
                        assignedWorker: "Unassigned",
                        hasCustomTimes: false,
                        breakTimeMinutes: 0,
                        marketId: job.store.market?.id || null,
                        storeId: job.storeId,
                        jobId: job.id,
                        date: job.date ? job.date.toISOString() : null,
                    }];
                }

                let assignments = allAssignments;

                if (dateParam && dayStart && dayEnd && dayOfWeek !== null) {
                    const queryDate = new Date(dateParam + "T00:00:00Z");
                    const qDay = queryDate.getUTCDate();
                    const qYear = queryDate.getUTCFullYear();
                    const qMonth = queryDate.getUTCMonth();
                    const queryCycleStart = qDay <= 15
                        ? new Date(Date.UTC(qYear, qMonth, 1, 0, 0, 0, 0))
                        : new Date(Date.UTC(qYear, qMonth, 16, 0, 0, 0, 0));
                    
                    const cycleHasStarted = queryCycleStart <= new Date();

                    // Keep only assignments relevant to the selected date:
                    // 1. Exact date match (specific-date or already-materialized recurring)
                    // 2. Recurring assignments whose stored date falls on the same weekday
                    //    (covers next-cycle patterns before auto-rollover creates the records)
                    const relevant = allAssignments.filter((a: any) => {
                        if (!a.date) return false;
                        const d = new Date(a.date);
                        if (d >= dayStart && d <= dayEnd) return true;
                        if (a.isRecurring && !cycleHasStarted && d.getUTCDay() === dayOfWeek) return true;
                        return false;
                    });

                    // Deduplicate by workerId so recurring patterns don't show the same worker N times
                    const seen = new Set<string>();
                    assignments = relevant.filter((a: any) => {
                        const key = a.workerId || a.id;
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                    });

                    // Has assignments but none match today — skip entirely (don't show as Unassigned)
                    if (assignments.length === 0) return [];
                }

                return assignments.map((a: any) => ({
                    id: job.id,
                    assignmentId: a.id,
                    workerId: a.workerId,
                    status: a.status,
                    requestedWorkerId: a.requestedWorkerId,
                    storeName: job.store.name,
                    startTime: a.customStartTimeStr || job.startTimeStr || "--",
                    endTime: a.customEndTimeStr || job.endTimeStr || "--",
                    marketName: job.store.market?.name || "—",
                    assignedWorker: a.worker?.name || "Unassigned",
                    hasCustomTimes: !!(a.customStartTimeStr || a.customEndTimeStr),
                    breakTimeMinutes: a.breakTimeMinutes ?? 0,
                    marketId: job.store.market?.id || null,
                    storeId: job.storeId,
                    jobId: job.id,
                    date: a.date ? a.date.toISOString() : null,
                }));
            });

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
                shiftEnd: a.job.endTimeStr || "--",
                timezone: a.job.store.timezone || "America/Chicago"
            }));

            return NextResponse.json({ data });
        }

        if (type === "recaps") {
            let assignmentDateFilter: any = {};
            if (dateParam) {
                const startStr = `${dateParam}T00:00:00Z`;
                const endStr = `${dateParam}T23:59:59Z`;
                assignmentDateFilter = {
                    date: { gte: new Date(startStr), lte: new Date(endStr) }
                };
            }

            const assignments = await prisma.jobAssignment.findMany({
                where: {
                    job: whereJob,
                    status: "RECAP_PENDING",
                    ...assignmentDateFilter
                },
                include: {
                    recap: { select: { status: true } },
                    worker: { select: { id: true, name: true } },
                    job: {
                        include: {
                            store: { include: { market: { select: { name: true } } } }
                        }
                    }
                }
            });

            // Only show assignments where no recap submitted yet, or recap was rejected
            const filtered = assignments.filter((a: any) => !a.recap || a.recap.status === "REJECTED");

            const data = filtered.map((a: any) => ({
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
