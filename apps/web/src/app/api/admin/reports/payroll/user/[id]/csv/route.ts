import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getMarketTimezone, localTimeToUTC } from "@/lib/timezone";
import {
    buildDateMarkerRange,
    buildCycleAssignmentWhere,
    assignmentBelongsToCyclePreciseCheck,
    computeAssignedHours,
    computeWorkedHours,
    computeBonus,
} from "@/lib/payroll";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !["ADMIN", "MARKET_MANAGER"].includes(session.user.role)) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const resolvedParams = await context.params;
        const userId = resolvedParams.id;

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        if (!startDate || !endDate) return new NextResponse("Missing date parameters", { status: 400 });

        // See apps/web/src/lib/payroll.ts for the full explanation of the date-marker vs
        // real-time boundary distinction.
        const dateMarkerRange = buildDateMarkerRange(startDate, endDate);
        const DEFAULT_TZ = "America/Chicago";
        const PAD_MS = 3 * 60 * 60 * 1000;
        const paddedRealStart = new Date(localTimeToUTC(startDate, "00:00", DEFAULT_TZ).getTime() - PAD_MS);
        const paddedRealEnd = new Date(localTimeToUTC(endDate, "23:59", DEFAULT_TZ).getTime() + PAD_MS);

        const user: any = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                market: true,
                jobs: {
                    where: buildCycleAssignmentWhere(dateMarkerRange, paddedRealStart, paddedRealEnd),
                    include: {
                        job: { include: { store: true } },
                        recap: true as any
                    },
                    orderBy: { date: "asc" }
                }
            } as any
        } as any);

        if (!user) return new NextResponse("User not found", { status: 404 });

        const marketTz = user.market?.name ? getMarketTimezone(user.market.name) : DEFAULT_TZ;
        const preciseStart = localTimeToUTC(startDate, "00:00", marketTz);
        const preciseEnd = localTimeToUTC(endDate, "23:59", marketTz);
        const relevantAssignments = (user.jobs as any[]).filter((a) =>
            assignmentBelongsToCyclePreciseCheck(a, preciseStart, preciseEnd)
        );

        const hourlyWage = user.hourlyWage || 0;
        let csvContent = "";
        csvContent += `Pay Report for ${user.name}\n`;
        csvContent += `Pay Cycle: ${startDate} to ${endDate}\n`;
        csvContent += `Hourly Wage: $${hourlyWage.toFixed(2)}/hr\n\n`;
        csvContent += `Date,Store,Clock In,Clock Out,Break (min),Assigned Hours,Hours Worked,Reimbursement,Bonus,Shift Pay,Total Shift Pay,Taxable Pay\n`;

        // Runs server-side — must pass timeZone explicitly or this defaults to the server's
        // system timezone (UTC on Vercel), not the store's actual local time.
        const formatClockTime = (dt: any) =>
            dt ? new Date(dt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZone: "America/Chicago" }) : "--";

        let sumAssigned = 0;
        let sumWorked = 0;
        let sumReimb = 0;
        let sumBonus = 0;

        for (const assignment of relevantAssignments) {
            const worked = computeWorkedHours(assignment);
            // Reimbursement only counts once the recap is approved — matches the other
            // payroll views; a submitted-but-unreviewed amount isn't confirmed pay yet.
            const reimb = assignment.recap?.status === "APPROVED" ? (assignment.recap.reimbursement || 0) : 0;
            const bonus = computeBonus(assignment);
            const shiftPay = worked * hourlyWage;
            const totalPay = shiftPay + reimb + bonus;
            // Everything except reimbursement — wages and bonus are taxable, reimbursement isn't.
            const taxablePay = shiftPay + bonus;

            const assignedH = computeAssignedHours(assignment);

            sumAssigned += assignedH;
            sumWorked += worked;
            sumReimb += reimb;
            sumBonus += bonus;

            const dateLabel = assignment.date ? assignment.date.toLocaleDateString(undefined, { timeZone: "UTC" }) : "--";
            const storeLabel = assignment.job.store.name.replace(/"/g, '""');
            const breakMins = Math.round(assignment.breakTimeMinutes || 0);
            csvContent += `${dateLabel},"${storeLabel}",${formatClockTime(assignment.clockIn)},${formatClockTime(assignment.clockOut)},${breakMins},${assignedH.toFixed(2)},${worked.toFixed(2)},${reimb.toFixed(2)},${bonus.toFixed(2)},${shiftPay.toFixed(2)},${totalPay.toFixed(2)},${taxablePay.toFixed(2)}\n`;
        }

        const sumShiftPay = sumWorked * hourlyWage;
        csvContent += `\nTotal,,,,,${sumAssigned.toFixed(2)},${sumWorked.toFixed(2)},${sumReimb.toFixed(2)},${sumBonus.toFixed(2)},${sumShiftPay.toFixed(2)},${(sumShiftPay + sumReimb + sumBonus).toFixed(2)},${(sumShiftPay + sumBonus).toFixed(2)}\n`;

        const filename = `Payroll_Report_${user.name.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.csv`;

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="${filename}"`
            }
        });
    } catch (error) {
        console.error("CSV generation error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
