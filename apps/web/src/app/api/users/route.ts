import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCurrentCycleDates } from "@/lib/cycles";
import { buildRateResolver, getWorkerRate } from "@/lib/payRate";
import { resolveReleasesStillOwned, sumReleaseHoursToSubtract } from "@/lib/payroll";

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

        // Batched once for the whole page, not per-user/per-shift — see payRate.ts.
        const rateHistoryMap = await buildRateResolver(users.map((u: any) => u.id));

        // Helper: calculate base hours (and rate-aware wage) for a user
        const calcHours = (user: any) => {
            let assignedHours = 0;
            let workedHours = 0;
            let totalReimbursement = 0;
            let totalBonus = 0;
            let totalWage = 0;

            user.jobs.forEach((assignment: any) => {
                const job = assignment.job;
                if (job && job.startTimeStr && job.endTimeStr) {
                    const [sh, sm] = job.startTimeStr.split(":").map(Number);
                    const [eh, em] = job.endTimeStr.split(":").map(Number);
                    let durationMins = (eh * 60 + em) - (sh * 60 + sm);
                    if (durationMins < 0) durationMins += 24 * 60;
                    assignedHours += durationMins / 60;

                    let assignmentWorkedHours = 0;
                    if (typeof assignment.workedHours === 'number') {
                        assignmentWorkedHours = assignment.workedHours;
                    } else if (assignment.clockIn && assignment.clockOut) {
                        const cIn = new Date(assignment.clockIn);
                        const cOut = new Date(assignment.clockOut);
                        if (!isNaN(cIn.getTime()) && !isNaN(cOut.getTime())) {
                            const breakMinutes = assignment.breakTimeMinutes || 0;
                            const diffMins = (cOut.getTime() - cIn.getTime()) / 60000;
                            assignmentWorkedHours = Math.max(0, (diffMins - breakMinutes) / 60);
                        }
                    }
                    workedHours += assignmentWorkedHours;
                    // Price this shift at the rate in effect on its own date, not always
                    // today's current rate — see apps/web/src/lib/payRate.ts.
                    totalWage += assignmentWorkedHours * getWorkerRate(rateHistoryMap, user.id, assignment.date, user.hourlyWage);

                    // Only count bonus and reimbursement for completed/approved shifts
                    if (assignment.recap?.status === "APPROVED") {
                        if (assignment.recap.reimbursement) totalReimbursement += assignment.recap.reimbursement;
                        if (assignment.bonus) totalBonus += assignment.bonus;
                        if (job.bonus) totalBonus += job.bonus;
                    }
                }
            });

            return { assignedHours, workedHours, totalReimbursement, totalBonus, totalWage };
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

        // Batched once for the whole page — see payroll.ts for why a release's hours must
        // only be subtracted when its assignment is still actually owned by the releaser.
        const releaseStillOwned = await resolveReleasesStillOwned(approvedReleases);

        const usersWithHours = users.map((user: any) => {
            let { assignedHours, workedHours, totalReimbursement, totalBonus, totalWage } = calcHours(user);

            // Subtract released shift hours — only those still owned by this worker.
            const userReleases = releasesByWorker[user.id] || [];
            assignedHours -= sumReleaseHoursToSubtract(userReleases, releaseStillOwned);
            if (assignedHours < 0) assignedHours = 0;

            const { jobs, ...userData } = user;
            const hasManualOverride = user.manualWorkedHours !== null && user.manualWorkedHours !== undefined;
            const finalWorkedHours = hasManualOverride
                ? user.manualWorkedHours
                : parseFloat(workedHours.toFixed(2));

            // Known limitation: manualWorkedHours has no "manual total wage" concept, only
            // manual hours × today's current rate — this legacy path is left untouched, so a
            // worker with both a manual-hours override and a mid-period rate change will
            // diverge from the rate-aware path below. See plan doc for why this is accepted.
            const payForCycle = hasManualOverride
                ? (user.manualWorkedHours * (user.hourlyWage || 0)) + totalReimbursement + totalBonus
                : totalWage + totalReimbursement + totalBonus;

            return {
                ...userData,
                assignedHours: parseFloat(assignedHours.toFixed(2)),
                workedHours: finalWorkedHours,
                totalReimbursement: parseFloat(totalReimbursement.toFixed(2)),
                totalBonus: parseFloat(totalBonus.toFixed(2)),
                payForCycle: parseFloat(payForCycle.toFixed(2))
            };
        });

        return NextResponse.json(usersWithHours);
    } catch (error) {
        console.error("GET Users error:", error);
        return NextResponse.json({ error: "Internal server error", details: (error as any).message }, { status: 500 });
    }
}

