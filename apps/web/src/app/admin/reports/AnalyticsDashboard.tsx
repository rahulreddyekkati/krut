"use client";

import { useEffect, useState } from "react";
import styles from "./reports.module.css";

interface AnalyticsDashboardProps {
    startDate: string;
    endDate: string;
}

export default function AnalyticsDashboard({ startDate, endDate }: AnalyticsDashboardProps) {
    const [data, setData] = useState<any>(null);
    const [workers, setWorkers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!startDate || !endDate) return;
            setLoading(true);
            try {
                const [analyticsRes, perfRes] = await Promise.all([
                    fetch(`/api/admin/reports/analytics?startDate=${startDate}&endDate=${endDate}`),
                    fetch(`/api/admin/reports/worker-performance?startDate=${startDate}&endDate=${endDate}`)
                ]);
                if (analyticsRes.ok) setData(await analyticsRes.json());
                if (perfRes.ok) { const d = await perfRes.json(); setWorkers(d.workers || []); }
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [startDate, endDate]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Calculating insights...</p>
            </div>
        );
    }

    if (!data || data.summary.count === 0) {
        return (
            <div className="card glass text-center" style={{ padding: "4rem" }}>
                <p className="text-secondary">No recorded data found for the selected period.</p>
                <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>Ensure recaps are submitted and approved to see analytics.</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboardGrid}>
            {/* Top Metric Cards */}
            <div className={styles.metricRow}>
                <div className="card glass">
                    <p className="text-secondary" style={{ fontSize: "0.875rem", fontWeight: 600 }}>TOTAL SALES</p>
                    <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent)", marginTop: "0.5rem" }}>
                        ${data.summary.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h3>
                </div>
                <div className="card glass">
                    <p className="text-secondary" style={{ fontSize: "0.875rem", fontWeight: 600 }}>CUSTOMERS ENGAGED</p>
                    <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)", marginTop: "0.5rem" }}>
                        {data.summary.totalCustomers.toLocaleString()}
                    </h3>
                </div>
                <div className="card glass">
                    <p className="text-secondary" style={{ fontSize: "0.875rem", fontWeight: 600 }}>EFFICIENCY (Sales/Customer)</p>
                    <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--success)", marginTop: "0.5rem" }}>
                        ${data.summary.totalCustomers > 0 ? (data.summary.totalSales / data.summary.totalCustomers).toFixed(2) : "0.00"}
                    </h3>
                </div>
                <div className="card glass">
                    <p className="text-secondary" style={{ fontSize: "0.875rem", fontWeight: 600 }}>TOTAL REIMbursements</p>
                    <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--danger)", marginTop: "0.5rem" }}>
                        ${data.summary.totalReimb.toLocaleString()}
                    </h3>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
                {/* Top Stores Table */}
                <div className="card glass">
                    <div className={styles.cardHeader}>
                        <h4 className="heading h4">Top Performing Stores</h4>
                        <p className="text-secondary">By Gross Sales</p>
                    </div>
                    <table style={{ width: "100%", marginTop: "1rem", borderCollapse: "collapse" }}>
                        <tbody>
                            {data.topStores.map((store: any, i: number) => (
                                <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                    <td style={{ padding: "0.75rem 0" }}>
                                        <div style={{ fontWeight: 600 }}>{store.name}</div>
                                    </td>
                                    <td style={{ padding: "0.75rem 0", textAlign: "right" }}>
                                        <div style={{ fontWeight: 800, color: "var(--accent)" }}>${store.sales.toLocaleString()}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Top SKUs Table */}
                <div className="card glass">
                    <div className={styles.cardHeader}>
                        <h4 className="heading h4">Inventory Summary</h4>
                        <p className="text-secondary">Quantity Sold</p>
                    </div>
                    <table style={{ width: "100%", marginTop: "1rem", borderCollapse: "collapse" }}>
                        <tbody>
                            {data.topSkus.map((sku: any, i: number) => (
                                <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                    <td style={{ padding: "0.75rem 0" }}>
                                        <div style={{ fontWeight: 600 }}>{sku.name}</div>
                                    </td>
                                    <td style={{ padding: "0.75rem 0", textAlign: "right" }}>
                                        <div style={{ fontWeight: 800, color: "var(--primary)" }}>{sku.sold} units</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Daily Trend */}
            <div className="card glass" style={{ marginTop: "1.5rem" }}>
                <div className={styles.cardHeader}>
                    <h4 className="heading h4">Daily Performance Trend</h4>
                </div>
                <div style={{ padding: "1rem 0", display: "flex", gap: "1rem", overflowX: "auto" }}>
                    {data.trend.map((day: any) => (
                        <div key={day.date} className="card" style={{ minWidth: "120px", textAlign: "center", background: "var(--bg-secondary)" }}>
                            <p style={{ fontSize: "0.75rem", fontWeight: 600 }}>{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                            <p style={{ fontSize: "1.125rem", fontWeight: 800, marginTop: "0.25rem" }}>${day.sales.toFixed(0)}</p>
                            <p style={{ fontSize: "0.75rem", color: "var(--secondary)" }}>{day.customers} cust.</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Worker Performance Leaderboard */}
            {workers.length > 0 && (
                <div className="card glass" style={{ marginTop: "1.5rem" }}>
                    <div className={styles.cardHeader}>
                        <h4 className="heading h4">Worker Performance</h4>
                        <p className="text-secondary">Ranked by avg sales per shift — based on approved recaps</p>
                    </div>
                    <div style={{ overflowX: "auto", marginTop: "1rem" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 700, color: "var(--secondary)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>#</th>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 700, color: "var(--secondary)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Worker</th>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "center", fontWeight: 700, color: "var(--secondary)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Shifts</th>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "right", fontWeight: 700, color: "var(--secondary)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Avg Sales</th>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "right", fontWeight: 700, color: "var(--secondary)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Avg Customers</th>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "right", fontWeight: 700, color: "var(--secondary)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Avg Reimb</th>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "center", fontWeight: 700, color: "var(--secondary)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Typical Rush</th>
                                    <th style={{ padding: "0.5rem 0.75rem", textAlign: "center", fontWeight: 700, color: "var(--secondary)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Risk</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...workers]
                                    .sort((a, b) => b.avgReceiptSales - a.avgReceiptSales)
                                    .map((w, i) => {
                                        const rank = i + 1;
                                        const total = workers.length;
                                        const isTop = rank <= Math.ceil(total * 0.3);
                                        const isBottom = rank > Math.floor(total * 0.7);
                                        const rowBg = isTop ? "#f0fdf4" : isBottom ? "#fff7ed" : "transparent";
                                        const riskColor = w.riskScore >= 60 ? "#dc2626" : w.riskScore >= 30 ? "#d97706" : "#16a34a";
                                        const riskLabel = w.riskScore >= 60 ? "High" : w.riskScore >= 30 ? "Medium" : "Low";
                                        return (
                                            <tr key={w.workerId} style={{ borderBottom: "1px solid var(--border-color)", background: rowBg }}>
                                                <td style={{ padding: "0.75rem", fontWeight: 800, color: isTop ? "#15803d" : isBottom ? "#92400e" : "var(--secondary)" }}>
                                                    {isTop ? "🥇" : isBottom ? "🔻" : rank}
                                                </td>
                                                <td style={{ padding: "0.75rem" }}>
                                                    <div style={{ fontWeight: 700 }}>{w.workerName}</div>
                                                    <div style={{ fontSize: "0.75rem", color: "var(--secondary)" }}>{w.workerEmail}</div>
                                                </td>
                                                <td style={{ padding: "0.75rem", textAlign: "center", fontWeight: 600 }}>{w.shifts}</td>
                                                <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: 700, color: "var(--accent)" }}>${w.avgReceiptSales.toFixed(2)}</td>
                                                <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: 600 }}>{w.avgCustomersSampled}</td>
                                                <td style={{ padding: "0.75rem", textAlign: "right", color: w.avgReimbursement > w.avgReceiptSales ? "#dc2626" : "var(--text)", fontWeight: w.avgReimbursement > w.avgReceiptSales ? 700 : 500 }}>
                                                    ${w.avgReimbursement.toFixed(2)}
                                                    {w.avgReimbursement > w.avgReceiptSales && <span title="Reimbursements exceed sales"> ⚠</span>}
                                                </td>
                                                <td style={{ padding: "0.75rem", textAlign: "center" }}>
                                                    <span style={{
                                                        padding: "0.2rem 0.6rem",
                                                        borderRadius: "999px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: 600,
                                                        background: w.typicalRushLevel === "VERY_BUSY" ? "#fce4ec" : w.typicalRushLevel === "MEDIUM" ? "#fff3e0" : "#e8f5e9",
                                                        color: w.typicalRushLevel === "VERY_BUSY" ? "#b71c1c" : w.typicalRushLevel === "MEDIUM" ? "#e65100" : "#1b5e20"
                                                    }}>
                                                        {w.typicalRushLevel === "VERY_BUSY" ? "Very Busy" : w.typicalRushLevel === "MEDIUM" ? "Medium" : w.typicalRushLevel === "SLOW" ? "Slow" : "—"}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "0.75rem", textAlign: "center" }}>
                                                    <span style={{
                                                        padding: "0.2rem 0.75rem",
                                                        borderRadius: "999px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: 700,
                                                        background: w.riskScore >= 60 ? "#fee2e2" : w.riskScore >= 30 ? "#fef3c7" : "#dcfce7",
                                                        color: riskColor
                                                    }}>
                                                        {riskLabel}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--secondary)", marginTop: "0.75rem", padding: "0 0.25rem" }}>
                        🥇 Top 30% performers &nbsp;·&nbsp; 🔻 Bottom 30% &nbsp;·&nbsp; Risk = fraud signals across reimbursements, missing receipts, missing manager signatures
                    </p>
                </div>
            )}
        </div>
    );
}
