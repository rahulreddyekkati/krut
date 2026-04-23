import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCurrentCycleDates } from "@/lib/cycles";
import { resolveTimezone, getLocalDayBoundsUTC } from "@/lib/timezone";
import { toZonedTime } from "date-fns-tz";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const tz = resolveTimezone(request);
        const { start: dbTodayStart } = getLocalDayBoundsUTC(tz);

        const { start: cycleStart, end: cycleEnd } = getCurrentCycleDates();

        // 1. Core assignments filter: only show shifts from "Today" or later
        const assignments = await prisma.jobAssignment.findMany({
            where: {
                workerId: session.user.id,
                OR: [
                    { date: { gte: dbTodayStart } },
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
            orderBy: { createdAt: "desc" }
        });

        // 2. Current Cycle shifts (for the centerpiece schedule)
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
            orderBy: { createdAt: "desc" }
        });

        // 3. Releases
        const releases = await prisma.releaseRequest.findMany({
            where: {
                workerId: session.user.id,
                status: { in: ["APPROVED", "PENDING"] }
            }
        });

        const approvedReleaseDates = releases
            .filter((r: any) => r.status === "APPROVED" && r.date)
            .map((r: any) => r.date!.toISOString().split('T')[0]);

        const approvedReleaseKeys = releases
            .filter((r: any) => r.status === "APPROVED" && r.date)
            .map((r: any) => `${r.jobId}|${r.date!.toISOString().split('T')[0]}`);

        const pendingReleases = releases
            .filter((r: any) => r.status === "PENDING" && r.date)
            .map((r: any) => `${r.jobId}|${r.date!.toISOString().split('T')[0]}`);

        const zonedNow = toZonedTime(new Date(), tz);
        const todayDay = zonedNow.getDay();

        // Helper: get the occurrence date for a dayOfWeek relative to the local today
        const getOccurrenceDate = (dayOfWeek: number) => {
            const result = new Date(zonedNow);
            let distance = (dayOfWeek - todayDay + 7) % 7;
            result.setDate(zonedNow.getDate() + distance);
            result.setHours(0, 0, 0, 0); 
            return result;
        };

        const filterAssignments = (list: any[], minDate?: Date, maxDate?: Date) => {
            const valid = list.filter(a => {
                let shiftDate: Date;
                if (a.date) {
                    shiftDate = new Date(a.date);
                } else if (a.isRecurring && a.dayOfWeek !== null && a.dayOfWeek !== undefined) {
                    shiftDate = getOccurrenceDate(a.dayOfWeek);
                } else {
                    return false;
                }

                if (minDate && shiftDate < minDate) return false;
                if (maxDate && shiftDate > maxDate) return false;

                const dateStr = shiftDate.toISOString().split('T')[0];
                const key = `${a.jobId}|${dateStr}`;
                return !approvedReleaseKeys.includes(key);
            });

            const dateInstances = new Set(
                valid.filter(a => !a.isRecurring && a.date).map(a => `${a.jobId}|${new Date(a.date).toISOString().split('T')[0]}`)
            );

            return valid.filter(a => {
                if (a.isRecurring && a.dayOfWeek !== null && a.dayOfWeek !== undefined) {
                    const shiftDate = getOccurrenceDate(a.dayOfWeek);
                    const key = `${a.jobId}|${shiftDate.toISOString().split('T')[0]}`;
                    if (dateInstances.has(key)) return false;
                }
                return true;
            });
        };

        return NextResponse.json({
            upcoming: filterAssignments(assignments),
            currentCycle: filterAssignments(cycleAssignments, cycleStart, cycleEnd),
            cycleStart,
            cycleEnd,
            approvedReleases: approvedReleaseDates,
            pendingReleases
        });
    } catch (error) {
        console.error("My shifts GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
