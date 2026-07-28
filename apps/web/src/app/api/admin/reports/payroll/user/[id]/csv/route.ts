import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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

        const start = new Date(startDate + "T00:00:00");
        const end = new Date(endDate + "T23:59:59");

        const user: any = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                jobs: {
                    where: {
                        clockIn: { not: null },
                        date: { gte: start, lte: end }
                    },
                    include: {
                        job: { include: { store: true } },
                        recap: true as any
                    },
                    orderBy: { date: "asc" }
                }
            } as any
        } as any);

        if (!user) return new NextResponse("User not found", { status: 404 });

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

        for (const assignment of user.jobs) {
            const worked = assignment.workedHours || 0;
            const reimb = assignment.recap?.reimbursement || 0;
            const bonus = (assignment.bonus || 0) + (assignment.job?.bonus || 0);
            const shiftPay = worked * hourlyWage;
            const totalPay = shiftPay + reimb + bonus;
            // Everything except reimbursement — wages and bonus are taxable, reimbursement isn't.
            const taxablePay = shiftPay + bonus;

            const startTimeStr = assignment.customStartTimeStr ?? assignment.job?.startTimeStr;
            const endTimeStr = assignment.customEndTimeStr ?? assignment.job?.endTimeStr;
            let assignedH = 0;
            if (startTimeStr && endTimeStr) {
                const [sh, sm] = startTimeStr.split(":").map(Number);
                const [eh, em] = endTimeStr.split(":").map(Number);
                let durationMins = (eh * 60 + em) - (sh * 60 + sm);
                if (durationMins < 0) durationMins += 24 * 60;
                assignedH = durationMins / 60;
            }

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
