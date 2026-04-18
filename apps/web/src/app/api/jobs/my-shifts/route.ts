import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCurrentCycleDates } from "@/lib/cycles";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { start: cycleStart, end: cycleEnd } = getCurrentCycleDates();

        const assignments = await prisma.jobAssignment.findMany({
            where: {
                workerId: session.user.id,
                OR: [
                    { date: { gte: new Date() } },
                    { isRecurring: true }
                ]
            },
            include: {
                job: {
                    include: {
                        store: { select: { name: true, address: true } },
                        market: { select: { name: true } }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        // Current Cycle shifts (for the centerpiece schedule)
        const cycleAssignments = await prisma.jobAssignment.findMany({
            where: {
                workerId: session.user.id,
                OR: [
                    { date: { gte: cycleStart, lte: cycleEnd } },
                    { isRecurring: true }
                ]
            },
            include: {
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

        // Fetch APPROVED and PENDING release requests
        const releases = await prisma.releaseRequest.findMany({
            where: {
                workerId: session.user.id,
                status: { in: ["APPROVED", "PENDING"] }
            }
        });

        const approvedReleaseDates = releases
            .filter(r => r.status === "APPROVED" && r.date)
            .map(r => r.date!.toISOString().split('T')[0]);

        // Build jobId|date keys for approved releases (to filter recurring shifts too)
        const approvedReleaseKeys = releases
            .filter(r => r.status === "APPROVED" && r.date)
            .map(r => `${r.jobId}|${r.date!.toISOString().split('T')[0]}`);

        // Build a set of "jobId|date" keys for pending releases
        const pendingReleases = releases
            .filter(r => r.status === "PENDING" && r.date)
            .map(r => `${r.jobId}|${r.date!.toISOString().split('T')[0]}`);

        // Helper: get the next occurrence date for a dayOfWeek
        const getNextOccurrence = (dayOfWeek: number) => {
            const now = new Date();
            const result = new Date();
            const currentDay = now.getDay();
            let distance = (dayOfWeek - currentDay + 7) % 7;
            result.setDate(now.getDate() + distance);
            return result;
        };

        const filterAssignments = (list: any[], minDate?: Date, maxDate?: Date) => {
            const valid = list.filter(a => {
                let shiftDate: Date;
                if (a.date) {
                    shiftDate = new Date(a.date);
                } else if (a.isRecurring && a.dayOfWeek !== null && a.dayOfWeek !== undefined) {
                    shiftDate = getNextOccurrence(a.dayOfWeek);
                } else {
                    return false;
                }

                // Check bounds (if provided)
                if (minDate && shiftDate < minDate) return false;
                if (maxDate && shiftDate > maxDate) return false;

                const dateStr = shiftDate.toISOString().split('T')[0];
                
                // Check the jobId|date key for approved releases (works for both specific and recurring)
                const key = `${a.jobId}|${dateStr}`;
                if (approvedReleaseKeys.includes(key)) {
                    return false;
                }
                return true;
            });

            const dateInstances = new Set(
                valid.filter(a => !a.isRecurring && a.date).map(a => `${a.jobId}|${new Date(a.date).toISOString().split('T')[0]}`)
            );

            return valid.filter(a => {
                if (a.isRecurring && a.dayOfWeek !== null && a.dayOfWeek !== undefined) {
                    const shiftDate = getNextOccurrence(a.dayOfWeek);
                    const key = `${a.jobId}|${shiftDate.toISOString().split('T')[0]}`;
                    if (dateInstances.has(key)) {
                        return false;
                    }
                }
                return true;
            });
        };

        return NextResponse.json({
            upcoming: filterAssignments(assignments),
            currentCycle: filterAssignments(cycleAssignments, cycleStart, cycleEnd),
            cycleStart,
            cycleEnd,
            approvedReleases: approvedReleaseDates, // Pass this so frontend can hide specific recurring days
            pendingReleases // Pass jobId|date keys so frontend shows "Requested" instead of Release
        });
    } catch (error) {
        console.error("My shifts GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
