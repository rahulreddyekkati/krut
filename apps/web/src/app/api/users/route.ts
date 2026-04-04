import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCurrentCycleDates } from "@/lib/cycles";

// GET /api/users - List all users with counts
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const requester = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!requester || (requester.role !== "ADMIN" && requester.role !== "MARKET_MANAGER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const where: any = {};
        if (requester.role === "MARKET_MANAGER") {
            where.marketId = requester.managedMarketId;
            where.role = { not: "ADMIN" };
        }

        const { start: cycleStart, end: cycleEnd } = getCurrentCycleDates();

        const users = await prisma.user.findMany({
            where,
            include: {
                _count: {
                    select: { jobs: true, createdJobs: true, sentInvites: true }
                },
                market: { select: { name: true } },
                managedMarket: { select: { name: true } },
                jobs: {
                    where: {
                        OR: [
                            // Dated shifts within the cycle
                            { date: { gte: cycleStart, lte: cycleEnd } },
                            // Already worked shifts within the cycle
                            { clockIn: { gte: cycleStart, lte: cycleEnd } },
                            // Recurring shifts (no fixed date) that haven't been worked yet
                            { 
                                AND: [
                                    { date: null },
                                    { clockIn: null },
                                    { dayOfWeek: { not: null } } // Ignore malformed shifts missing a day
                                ]
                            }
                        ]
                    },
                    include: {
                        job: true,
                        recap: true
                    } as any
                }
            },
            orderBy: { createdAt: "desc" }
        });

        // Helper: calculate base hours for a user
        const calcHours = (user: any) => {
            let assignedHours = 0;
            let workedHours = 0;
            let totalReimbursement = 0;

            const seenJobRecaps = new Set<string>();
            user.jobs.forEach((assignment: any) => {
                const job = assignment.job;
                if (job && job.startTimeStr && job.endTimeStr) {
                    const [sh, sm] = job.startTimeStr.split(":").map(Number);
                    const [eh, em] = job.endTimeStr.split(":").map(Number);
                    let durationMins = (eh * 60 + em) - (sh * 60 + sm);
                    if (durationMins < 0) durationMins += 24 * 60;
                    const duration = durationMins / 60;
                    assignedHours += duration;

                    if (typeof assignment.workedHours === 'number') {
                        workedHours += assignment.workedHours;
                    } else if (assignment.clockIn && assignment.clockOut) {
                        const cIn = new Date(assignment.clockIn);
                        const cOut = new Date(assignment.clockOut);
                        if (!isNaN(cIn.getTime()) && !isNaN(cOut.getTime())) {
                            const breakMinutes = assignment.breakTimeMinutes || 0;
                            const diffMins = (cOut.getTime() - cIn.getTime()) / 60000;
                            workedHours += Math.max(0, (diffMins - breakMinutes) / 60);
                        }
                    }

                    if (assignment.recap?.reimbursement && assignment.recap?.status === "APPROVED") {
                        totalReimbursement += assignment.recap.reimbursement;
                    }
                }
            });

            return { assignedHours, workedHours, totalReimbursement };
        };

        // Fetch approved releases this week to subtract from assignedHours
        const approvedReleases = await prisma.releaseRequest.findMany({
            where: {
                status: "APPROVED",
                date: { gte: cycleStart, lte: cycleEnd }
            },
            include: {
                job: { select: { startTimeStr: true, endTimeStr: true } }
            }
        });

        const releasesByWorker: Record<string, typeof approvedReleases> = {};
        for (const rel of approvedReleases) {
            if (!releasesByWorker[rel.workerId]) releasesByWorker[rel.workerId] = [];
            releasesByWorker[rel.workerId].push(rel);
        }

        const usersWithHours = users.map((user: any) => {
            let { assignedHours, workedHours, totalReimbursement } = calcHours(user);

            // Subtract released shift hours
            const userReleases = releasesByWorker[user.id] || [];
            for (const rel of userReleases) {
                if (rel.job.startTimeStr && rel.job.endTimeStr) {
                    const [sh, sm] = rel.job.startTimeStr.split(":").map(Number);
                    const [eh, em] = rel.job.endTimeStr.split(":").map(Number);
                    let durationMins = (eh * 60 + em) - (sh * 60 + sm);
                    if (durationMins < 0) durationMins += 24 * 60;
                    assignedHours -= durationMins / 60;
                }
            }
            if (assignedHours < 0) assignedHours = 0;

            const { jobs, ...userData } = user;
            const finalWorkedHours = user.manualWorkedHours !== null && user.manualWorkedHours !== undefined
                ? user.manualWorkedHours
                : parseFloat(workedHours.toFixed(2));

            return {
                ...userData,
                assignedHours: parseFloat(assignedHours.toFixed(2)),
                workedHours: finalWorkedHours,
                totalReimbursement: parseFloat(totalReimbursement.toFixed(2))
            };
        });

        return NextResponse.json(usersWithHours);
    } catch (error) {
        console.error("DEBUG: GET Users error full details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return NextResponse.json({ error: "Internal server error", details: (error as any).message }, { status: 500 });
    }
}

