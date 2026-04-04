import React, { Suspense } from "react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import PrintButton from "./PrintButton";

export default async function UserPayrollDetailsPage({
    params,
    searchParams
}: {
    params: { id: string },
    searchParams: { startDate?: string, endDate?: string }
}) {
    const session = await getSession();
    if (!session || !["ADMIN", "MARKET_MANAGER", "STORE_MANAGER"].includes(session.user.role)) {
        redirect("/login");
    }

    const { id } = await params;
    const { startDate, endDate } = await searchParams;

    if (!startDate || !endDate) {
        return <div className="p-8">Please provide a valid start and end date.</div>;
    }

    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T23:59:59");

    const user: any = await prisma.user.findUnique({
        where: { id },
        include: {
            market: true,
            homeStore: true,
            jobs: {
                where: {
                    clockIn: { not: null },
                    date: { gte: start, lte: end }
                },
                include: {
                    job: {
                        include: { store: { include: { market: true } } }
                    },
                    recap: true
                },
                orderBy: { date: "asc" }
            }
        } as any
    });

    if (!user) {
        return <div className="p-8">User not found.</div>;
    }

    const hourlyWage = user.hourlyWage || 0;
    let totalWorkedHours = 0;
    let totalReimb = 0;

    const shiftRows = user.jobs.map((assignment: any) => {
        const workedH = assignment.workedHours || 0;
        const reimb = assignment.recap?.reimbursement || 0;
        const shiftPay = workedH * hourlyWage;
        const totalPay = shiftPay + reimb;

        totalWorkedHours += workedH;
        totalReimb += reimb;

        return {
            id: assignment.id,
            date: assignment.date ? assignment.date.toLocaleDateString() : "--",
            store: assignment.job.store.name,
            market: assignment.job.store.market?.name || "--",
            hours: workedH.toFixed(2),
            reimb: reimb.toFixed(2),
            shiftPay: shiftPay.toFixed(2),
            totalPay: totalPay.toFixed(2)
        };
    });

    const totalCyclePay = (totalWorkedHours * hourlyWage) + totalReimb;

    return (
        <div style={{ backgroundColor: "white", minHeight: "100vh", padding: "2rem" }}>
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { padding: 0 !important; }
                    div { box-shadow: none !important; }
                }
            `}} />

            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                
                {/* Report Header */}
                <div style={{ marginBottom: "2.5rem" }}>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "#111827", margin: 0 }}>
                        Payroll Report
                    </h1>
                    <p style={{ color: "#4b5563", fontSize: "1.125rem", marginTop: "0.25rem" }}>
                        Generated on: {new Date().toLocaleDateString()}
                    </p>
                    <p style={{ color: "#6b7280", fontStyle: "italic", fontSize: "0.875rem" }}>
                        Pay Cycle: {startDate} to {endDate}
                    </p>
                </div>

                {/* Employee Information Section */}
                <div style={{ marginBottom: "2.5rem" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1f2937", marginBottom: "1rem" }}>
                        Employee Information
                    </h2>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "1rem", backgroundColor: "#fff" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#3f51b5", color: "white" }}>
                                <th style={{ padding: "0.875rem 1rem", textAlign: "left", width: "30%" }}>Field</th>
                                <th style={{ padding: "0.875rem 1rem", textAlign: "left" }}>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                                <td style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>Name</td>
                                <td style={{ padding: "0.875rem 1rem" }}>{user.name}</td>
                            </tr>
                            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                                <td style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>Email</td>
                                <td style={{ padding: "0.875rem 1rem" }}>{user.email}</td>
                            </tr>
                            <tr style={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                                <td style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>Role</td>
                                <td style={{ padding: "0.875rem 1rem" }}>{user.role}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Payroll Summary Section */}
                <div style={{ marginBottom: "2.5rem" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1f2937", marginBottom: "1rem" }}>
                        Payroll Summary
                    </h2>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "1rem" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#2e7d32", color: "white" }}>
                                <th style={{ padding: "0.875rem 1rem", textAlign: "left" }}>Description</th>
                                <th style={{ padding: "0.875rem 1rem", textAlign: "right", width: "25%" }}>Amount / Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                                <td style={{ padding: "0.875rem 1rem" }}>Worked Hours</td>
                                <td style={{ padding: "0.875rem 1rem", textAlign: "right", fontWeight: 700 }}>{totalWorkedHours.toFixed(2)}h</td>
                            </tr>
                            <tr style={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                                <td style={{ padding: "0.875rem 1rem" }}>Pay Rate</td>
                                <td style={{ padding: "0.875rem 1rem", textAlign: "right", fontWeight: 700 }}>${hourlyWage.toFixed(2)}/hr</td>
                            </tr>
                            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                                <td style={{ padding: "0.875rem 1rem" }}>Reimbursement</td>
                                <td style={{ padding: "0.875rem 1rem", textAlign: "right", fontWeight: 700 }}>${totalReimb.toFixed(2)}</td>
                            </tr>
                            <tr style={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                                <td style={{ padding: "0.875rem 1rem" }}>Total Wage (Hours * Rate)</td>
                                <td style={{ padding: "0.875rem 1rem", textAlign: "right", fontWeight: 700 }}>${(totalWorkedHours * hourlyWage).toFixed(2)}</td>
                            </tr>
                            <tr style={{ backgroundColor: "#e8f5e9", color: "#2e7d32", fontWeight: 800, fontSize: "1.1rem" }}>
                                <td style={{ padding: "1rem" }}>TOTAL PAY FOR CYCLE</td>
                                <td style={{ padding: "1rem", textAlign: "right" }}>
                                {user.role === "WORKER" ? `$${totalCyclePay.toFixed(2)}` : 'N/A'}
                            </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Shift Breakdown Section (Always good to have the raw data below) */}
                <div style={{ marginBottom: "2.5rem" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1f2937", marginBottom: "1rem" }}>
                        Detailed Shift Breakdown
                    </h2>
                    {shiftRows.length === 0 ? (
                        <div style={{ padding: "2rem", border: "1px solid #e5e7eb", borderRadius: "8px", textAlign: "center", color: "#6b7280" }}>
                            No worked shifts found for this pay cycle.
                        </div>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                                <tr>
                                    <th style={{ padding: "1rem", fontSize: "0.875rem", fontWeight: 600 }}>Date</th>
                                    <th style={{ padding: "1rem", fontSize: "0.875rem", fontWeight: 600 }}>Location</th>
                                    <th style={{ padding: "1rem", fontSize: "0.875rem", fontWeight: 600 }}>Hours</th>
                                    <th style={{ padding: "1rem", fontSize: "0.875rem", fontWeight: 600, textAlign: "right" }}>Shift Pay</th>
                                    <th style={{ padding: "1rem", fontSize: "0.875rem", fontWeight: 600, textAlign: "right" }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shiftRows.map((row: any) => (
                                    <tr key={row.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                        <td style={{ padding: "1rem" }}>{row.date}</td>
                                        <td style={{ padding: "1rem" }}>
                                            <div style={{ fontWeight: 500 }}>{row.store}</div>
                                            <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{row.market}</div>
                                        </td>
                                        <td style={{ padding: "1rem" }}>{row.hours}h</td>
                                        <td style={{ padding: "1rem", textAlign: "right" }}>${row.shiftPay}</td>
                                        <td style={{ padding: "1rem", textAlign: "right", fontWeight: 600 }}>${row.totalPay}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="no-print">
                    <Suspense fallback={null}>
                        <PrintButton />
                    </Suspense>
                </div>

            </div>
        </div>
    );
}
