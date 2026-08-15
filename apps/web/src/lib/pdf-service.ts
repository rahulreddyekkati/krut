import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface UserReportData {
    name: string;
    email: string;
    role: string;
    workedHours: number;
    hourlyWage?: number;
    totalReimbursement: number;
    totalBonus?: number;
    // Pre-computed by /api/users (each shift priced at the rate in effect on its own date,
    // not always today's current hourlyWage — see apps/web/src/lib/payRate.ts). Falls back to
    // the old flat workedHours * hourlyWage math for any caller that doesn't supply it yet.
    payForCycle?: number;
}

export const generateUserReportPDF = (user: UserReportData) => {
    const doc = new jsPDF();
    const payRate = user.hourlyWage || 0;
    const totalBonus = user.totalBonus || 0;
    const totalPay = user.payForCycle !== undefined
        ? user.payForCycle
        : (user.workedHours * payRate) + user.totalReimbursement;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 44, 52);
    doc.text("Payroll Report", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    // User Information section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Employee Information", 14, 45);

    autoTable(doc, {
        startY: 50,
        head: [['Field', 'Details']],
        body: [
            ['Name', user.name],
            ['Email', user.email],
            ['Role', user.role],
        ],
        theme: 'striped',
        headStyles: { fillColor: [63, 81, 181] },
    });

    // Payroll Summary section
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.text("Payroll Summary", 14, finalY);

    // Not simply Hours * Rate when payForCycle is supplied — each shift may be priced at
    // whatever rate was in effect on its own date (see apps/web/src/lib/payRate.ts), so this
    // is derived from the actual total rather than recomputed with one flat rate.
    const totalWage = totalPay - user.totalReimbursement - totalBonus;

    autoTable(doc, {
        startY: finalY + 5,
        head: [['Description', 'Amount / Value']],
        body: [
            ['Worked Hours', `${user.workedHours.toFixed(2)}h`],
            ['Current Pay Rate', `$${payRate.toFixed(2)}/hr`],
            ['Reimbursement', `$${user.totalReimbursement.toFixed(2)}`],
            ['Bonus', `$${totalBonus.toFixed(2)}`],
            ['Total Wage', `$${totalWage.toFixed(2)}`],
            ['TOTAL PAY FOR CYCLE', `$${totalPay.toFixed(2)}`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [46, 125, 50] }, // Green for payroll
        columnStyles: {
            1: { halign: 'right', fontStyle: 'bold' }
        },
        didParseCell: function (data: any) {
            if (data.row.index === 5) {
                data.cell.styles.fillColor = [232, 245, 233];
                data.cell.styles.textColor = [46, 125, 50];
            }
        }
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
            "Workforce Management System - Confidential",
            14,
            doc.internal.pageSize.height - 10
        );
    }

    // Save the PDF
    const filename = `Payroll_Report_${user.name.replace(/\s+/g, "_")}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
};
