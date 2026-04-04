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
        csvContent += `Date,Store,Hours Worked,Reimbursement,Shift Pay,Total Shift Pay\n`;

        let sumWorked = 0;
        let sumReimb = 0;

        for (const assignment of user.jobs) {
            const worked = assignment.workedHours || 0;
            const reimb = assignment.recap?.reimbursement || 0;
            const shiftPay = worked * hourlyWage;
            const totalPay = shiftPay + reimb;

            sumWorked += worked;
            sumReimb += reimb;

            csvContent += `${assignment.date ? assignment.date.toLocaleDateString() : "--"},"${assignment.job.store.name.replace(/"/g, '""')}",${worked.toFixed(2)},${reimb.toFixed(2)},${shiftPay.toFixed(2)},${totalPay.toFixed(2)}\n`;
        }

        csvContent += `\nTotal,,-,${sumWorked.toFixed(2)},${sumReimb.toFixed(2)},${(sumWorked * hourlyWage).toFixed(2)},${((sumWorked * hourlyWage) + sumReimb).toFixed(2)}\n`;

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
