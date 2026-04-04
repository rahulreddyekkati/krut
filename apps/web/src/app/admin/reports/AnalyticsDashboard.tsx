"use client";

import { useEffect, useState } from "react";
import styles from "./reports.module.css";

interface AnalyticsDashboardProps {
    startDate: string;
    endDate: string;
}

export default function AnalyticsDashboard({ startDate, endDate }: AnalyticsDashboardProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!startDate || !endDate) return;
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/reports/analytics?startDate=${startDate}&endDate=${endDate}`);
                if (res.ok) {
                    setData(await res.json());
                }
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

            {/* Daily Trend (Simple Text List for now, can be Chart) */}
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
        </div>
    );
}
