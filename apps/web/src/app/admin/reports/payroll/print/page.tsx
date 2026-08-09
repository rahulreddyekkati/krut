import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PrintButton from "../user/[id]/PrintButton";
import { getMarketTimezone, localTimeToUTC } from "@/lib/timezone";
import {
    buildDateMarkerRange,
    buildCycleAssignmentWhere,
    assignmentBelongsToCyclePreciseCheck,
    accumulatePayrollTotals,
    computePayFigures,
} from "@/lib/payroll";

export default async function PrintAllPayrollPage(props: {
    searchParams: Promise<{ startDate?: string; endDate?: string; market?: string }>;
}) {
    const session = await getSession();
    if (!session || !["ADMIN", "MARKET_MANAGER"].includes(session.user.role)) {
        redirect("/login");
    }

    const { startDate: startDateStr, endDate: endDateStr, market } = await props.searchParams;
    if (!startDateStr || !endDateStr) {
        return <div style={{ padding: "2rem" }}>Missing date range.</div>;
    }

    // See apps/web/src/lib/payroll.ts for the full explanation of why `date` (a UTC-midnight
    // calendar marker) and `clockIn` (a real timestamp) need two different boundary kinds,
    // and why a fixed `date` marker must be the single source of truth for cycle membership
    // (fixes cross-cycle double-counting for overnight shifts near a boundary).
    const dateMarkerRange = buildDateMarkerRange(startDateStr, endDateStr);

    // This is a server component with no request headers to resolve a viewer timezone from,
    // so "America/Chicago" is used as the default/fallback market timezone below (same
    // fallback the rest of the app uses when nothing more specific is known) — padded widely
    // enough here to safely over-fetch candidates regardless, then precisely re-checked per
    // each worker's own market below.
    const DEFAULT_TZ = "America/Chicago";
    const PAD_MS = 3 * 60 * 60 * 1000;
    const paddedRealStart = new Date(localTimeToUTC(startDateStr, "00:00", DEFAULT_TZ).getTime() - PAD_MS);
    const paddedRealEnd = new Date(localTimeToUTC(endDateStr, "23:59", DEFAULT_TZ).getTime() + PAD_MS);

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
                where: buildCycleAssignmentWhere(dateMarkerRange, paddedRealStart, paddedRealEnd),
                include: { job: true, recap: { include: { skus: true } } } as any,
            },
        },
    });

    const rows = users
        .map((user) => {
            const marketTz = user.market?.name ? getMarketTimezone(user.market.name) : DEFAULT_TZ;
            const preciseStart = localTimeToUTC(startDateStr, "00:00", marketTz);
            const preciseEnd = localTimeToUTC(endDateStr, "23:59", marketTz);
            const relevantAssignments = (user.jobs as any[]).filter((a) =>
                assignmentBelongsToCyclePreciseCheck(a, preciseStart, preciseEnd)
            );

            const totals = accumulatePayrollTotals(relevantAssignments);
            const wage = user.hourlyWage || 0;
            const { payForCycle, taxablePay } = computePayFigures(wage, totals);

            return {
                name: user.name || user.email,
                role: user.role,
                location: user.market?.name || "N/A",
                payHr: wage,
                worked: parseFloat(totals.totalWorkedHours.toFixed(2)),
                assigned: parseFloat(Math.max(0, totals.totalAssignedHours).toFixed(2)),
                reimb: parseFloat(totals.totalReimbursements.toFixed(2)),
                bottles: totals.totalBottlesSold,
                pay: user.role === "WORKER" ? parseFloat(payForCycle.toFixed(2)) : null,
                taxablePay: user.role === "WORKER" ? parseFloat(taxablePay.toFixed(2)) : null,
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
                        {new Date(startDateStr).toLocaleDateString()} – {new Date(endDateStr).toLocaleDateString()}
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
                        <th style={{ ...th, textAlign: "right" }} title="Pay for Cycle minus Reimbursement">Taxable Pay</th>
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
                            <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>
                                {r.taxablePay !== null ? `$${r.taxablePay.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "N/A"}
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
                        <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>
                            ${rows.filter(r => r.taxablePay !== null).reduce((s, r) => s + (r.taxablePay ?? 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
