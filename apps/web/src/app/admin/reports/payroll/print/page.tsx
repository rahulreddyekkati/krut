import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PrintButton from "../user/[id]/PrintButton";

export default async function PrintAllPayrollPage(props: {
    searchParams: Promise<{ startDate?: string; endDate?: string; market?: string }>;
}) {
    const session = await getSession();
    if (!session || !["ADMIN", "MARKET_MANAGER"].includes(session.user.role)) {
        redirect("/login");
    }

    const { startDate, endDate, market } = await props.searchParams;
    if (!startDate || !endDate) {
        return <div style={{ padding: "2rem" }}>Missing date range.</div>;
    }

    const start = new Date(startDate + "T00:00:00Z");
    const end = new Date(endDate + "T23:59:59Z");

    const requester: any = await prisma.user.findUnique({ where: { id: session.user.id } });
    const where: any = {};
    if (requester?.role === "MARKET_MANAGER") {
        where.marketId = requester.managedMarketId || requester.marketId;
        where.role = { not: "ADMIN" };
    }

    const users: any[] = await prisma.user.findMany({
        where,
        include: {
            market: { select: { name: true } },
            jobs: {
                where: {
                    OR: [
                        { date: { gte: start, lte: end } },
                        { clockIn: { gte: start, lte: end } },
                    ],
                },
                include: { job: true, recap: { include: { skus: true } } } as any,
            },
        },
    });

    const rows = users
        .map((user) => {
            let worked = 0, assigned = 0, reimb = 0, bottles = 0;
            user.jobs.forEach((a: any) => {
                const job = a.job;
                if (job?.startTimeStr && job?.endTimeStr) {
                    const [sh, sm] = job.startTimeStr.split(":").map(Number);
                    const [eh, em] = job.endTimeStr.split(":").map(Number);
                    let dur = (eh * 60 + em) - (sh * 60 + sm);
                    if (dur < 0) dur += 1440;
                    assigned += dur / 60;
                }
                if (typeof a.workedHours === "number") {
                    worked += a.workedHours;
                } else if (a.clockIn && a.clockOut) {
                    const diff = (new Date(a.clockOut).getTime() - new Date(a.clockIn).getTime()) / 60000;
                    worked += Math.max(0, (diff - (a.breakTimeMinutes || 0)) / 60);
                }
                if (a.recap?.status === "APPROVED") {
                    reimb += a.recap.reimbursement || 0;
                    (a.recap.skus || []).forEach((s: any) => { bottles += s.bottlesSold || 0; });
                }
            });
            const wage = user.hourlyWage || 0;
            return {
                name: user.name || user.email,
                role: user.role,
                location: user.market?.name || "N/A",
                payHr: wage,
                worked: parseFloat(worked.toFixed(2)),
                assigned: parseFloat(Math.max(0, assigned).toFixed(2)),
                reimb: parseFloat(reimb.toFixed(2)),
                bottles,
                pay: user.role === "WORKER" ? parseFloat(((worked * wage) + reimb).toFixed(2)) : null,
            };
        })
        .filter((r) => !market || market === "all" || r.location === market);

    const th: React.CSSProperties = {
        padding: "8px 12px", borderBottom: "2px solid #e5e7eb",
        textAlign: "left", fontSize: "0.7rem", fontWeight: 700,
        textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em",
    };
    const td: React.CSSProperties = {
        padding: "8px 12px", borderBottom: "1px solid #f3f4f6",
        fontSize: "0.875rem", color: "#111827",
    };

    return (
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: 0 }}>Payroll Report</h1>
                    <p style={{ color: "#6b7280", margin: "4px 0 0", fontSize: "0.875rem" }}>
                        {market && market !== "all" ? `Market: ${market}` : "All Markets"} &nbsp;·&nbsp;
                        {new Date(startDate).toLocaleDateString()} – {new Date(endDate).toLocaleDateString()}
                    </p>
                </div>
                <p style={{ color: "#9ca3af", fontSize: "0.8rem", margin: 0 }}>
                    Generated {new Date().toLocaleDateString()}
                </p>
            </div>

            {/* Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                    <tr style={{ background: "#f9fafb" }}>
                        <th style={th}>User</th>
                        <th style={th}>Role</th>
                        <th style={th}>Market</th>
                        <th style={{ ...th, textAlign: "right" }}>Pay/Hr</th>
                        <th style={{ ...th, textAlign: "right" }}>Worked</th>
                        <th style={{ ...th, textAlign: "right" }}>Assigned</th>
                        <th style={{ ...th, textAlign: "right" }}>Reimb.</th>
                        <th style={{ ...th, textAlign: "right" }}>Bottles Sold</th>
                        <th style={{ ...th, textAlign: "right" }}>Pay for Cycle</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i}>
                            <td style={{ ...td, fontWeight: 600 }}>{r.name}</td>
                            <td style={td}>{r.role}</td>
                            <td style={td}>{r.location}</td>
                            <td style={{ ...td, textAlign: "right" }}>${r.payHr.toFixed(2)}</td>
                            <td style={{ ...td, textAlign: "right" }}>{r.worked} hrs</td>
                            <td style={{ ...td, textAlign: "right" }}>{r.assigned} hrs</td>
                            <td style={{ ...td, textAlign: "right" }}>${r.reimb.toFixed(2)}</td>
                            <td style={{ ...td, textAlign: "right" }}>{r.role === "WORKER" ? r.bottles : "N/A"}</td>
                            <td style={{ ...td, textAlign: "right", fontWeight: 700, color: r.pay !== null ? "#059669" : "#6b7280" }}>
                                {r.pay !== null ? `$${r.pay.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "N/A"}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr style={{ background: "#f9fafb" }}>
                        <td colSpan={4} style={{ ...td, fontWeight: 700 }}>Totals (Workers Only)</td>
                        <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>
                            {rows.filter(r => r.role === "WORKER").reduce((s, r) => s + r.worked, 0).toFixed(2)} hrs
                        </td>
                        <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>
                            {rows.filter(r => r.role === "WORKER").reduce((s, r) => s + r.assigned, 0).toFixed(2)} hrs
                        </td>
                        <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>
                            ${rows.filter(r => r.role === "WORKER").reduce((s, r) => s + r.reimb, 0).toFixed(2)}
                        </td>
                        <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>
                            {rows.filter(r => r.role === "WORKER").reduce((s, r) => s + r.bottles, 0)}
                        </td>
                        <td style={{ ...td, textAlign: "right", fontWeight: 700, color: "#059669" }}>
                            ${rows.filter(r => r.pay !== null).reduce((s, r) => s + (r.pay ?? 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                    </tr>
                </tfoot>
            </table>

            <PrintButton />

            <style>{`
                @media print {
                    body { background: white !important; }
                    @page { margin: 1.5cm; }
                }
            `}</style>
        </div>
    );
}
