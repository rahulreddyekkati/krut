"use client";

import { useEffect, useState } from "react";
import PendingRecapsTable from "@/components/admin/PendingRecapsTable";

type DetailType = "jobs" | "active" | "recaps" | null;

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({ totalJobs: 0, activeWorkers: 0, pendingRecaps: 0 });
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    });
    const [activeDetail, setActiveDetail] = useState<DetailType>(null);
    const [detailData, setDetailData] = useState<any[]>([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [sendingNotification, setSendingNotification] = useState<string | null>(null);

    const fetchStats = async (date: string) => {
        setLoading(true);
        const statsRes = await fetch(`/api/admin/dashboard-stats?date=${date}`);
        if (statsRes.ok) {
            setStats(await statsRes.json());
        }
        setLoading(false);
    };

    useEffect(() => {
        async function fetchUser() {
            const meRes = await fetch("/api/auth/me");
            if (meRes.ok) {
                const data = await meRes.json();
                setUser(data.user);
            }
        }
        fetchUser();
        fetchStats(selectedDate);
    }, []);

    useEffect(() => {
        fetchStats(selectedDate);
        if (activeDetail) fetchDetailData(activeDetail);
    }, [selectedDate]);

    const fetchDetailData = async (type: DetailType) => {
        if (!type) return;
        setDetailLoading(true);
        const res = await fetch(`/api/admin/dashboard-details?type=${type}&date=${selectedDate}`);
        if (res.ok) {
            const json = await res.json();
            setDetailData(json.data || []);
        }
        setDetailLoading(false);
    };

    const handleCardClick = (type: DetailType) => {
        if (activeDetail === type) {
            setActiveDetail(null);
            setDetailData([]);
        } else {
            setActiveDetail(type);
            fetchDetailData(type);
        }
    };

    const handleSendNotification = async (workerId: string, workerName: string) => {
        setSendingNotification(workerId);
        try {
            await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipientId: workerId,
                    message: `Reminder: You have not completed your recap. Please submit it as soon as possible.`,
                    type: "RECAP_REMINDER"
                })
            });
            alert(`Notification sent to ${workerName}`);
        } catch (e) {
            alert("Failed to send notification");
        }
        setSendingNotification(null);
    };

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return "--";
        return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const isMM = user?.role === "MARKET_MANAGER";
    const title = isMM ? "Manager Dashboard" : "Admin Dashboard";
    const subtitle = isMM
        ? "Overview of metrics for your assigned region."
        : "Overview of system metrics across all markets.";

    const cardStyle = (type: DetailType): React.CSSProperties => ({
        cursor: "pointer",
        transition: "all 0.2s",
        borderColor: activeDetail === type ? "#6366f1" : undefined,
        borderWidth: activeDetail === type ? "2px" : undefined,
        background: activeDetail === type ? "#f5f3ff" : undefined,
    });

    const tableStyle: React.CSSProperties = {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "0.875rem"
    };

    const thStyle: React.CSSProperties = {
        textAlign: "left",
        padding: "0.75rem 1rem",
        borderBottom: "2px solid #e5e7eb",
        fontWeight: 700,
        color: "#374151",
        fontSize: "0.75rem",
        textTransform: "uppercase",
        letterSpacing: "0.03em"
    };

    const tdStyle: React.CSSProperties = {
        padding: "0.75rem 1rem",
        borderBottom: "1px solid #f3f4f6",
        color: "#111827"
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 className="heading h2">{title}</h1>
                    <p className="text-secondary">{subtitle}</p>
                </div>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "10px",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#374151",
                        background: "white",
                        cursor: "pointer",
                        outline: "none",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
                    }}
                />
            </div>

            <div className="grid gap-4" style={{ marginTop: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                <div className="card glass" style={cardStyle("jobs")} onClick={() => handleCardClick("jobs")}>
                    <h3 className="heading h4">Total Jobs</h3>
                    <p className="h2">{loading ? "..." : stats.totalJobs}</p>
                </div>
                <div className="card glass" style={cardStyle("active")} onClick={() => handleCardClick("active")}>
                    <h3 className="heading h4">Active Workers</h3>
                    <p className="h2">{loading ? "..." : stats.activeWorkers}</p>
                </div>
                <div className="card glass" style={cardStyle("recaps")} onClick={() => handleCardClick("recaps")}>
                    <h3 className="heading h4">Pending Recaps</h3>
                    <p className="h2">{loading ? "..." : stats.pendingRecaps}</p>
                </div>
            </div>

            {/* ── Detail Table Section ── */}
            {activeDetail && (
                <div className="card glass" style={{ marginTop: "1.5rem", overflow: "hidden" }}>
                    <h3 className="heading h4" style={{ marginBottom: "1rem" }}>
                        {activeDetail === "jobs" && "Jobs for Selected Date"}
                        {activeDetail === "active" && "Currently Active Workers"}
                        {activeDetail === "recaps" && "Pending Recaps"}
                    </h3>

                    {detailLoading ? (
                        <p style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>Loading...</p>
                    ) : detailData.length === 0 ? (
                        <p style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>No records found.</p>
                    ) : (
                        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                            {activeDetail === "recaps" ? (
                                <PendingRecapsTable recaps={detailData} />
                            ) : (
                            <table style={tableStyle}>
                                <thead>
                                    {activeDetail === "jobs" && (
                                        <tr>
                                            <th style={thStyle}>Store Name</th>
                                            <th style={thStyle}>Start Time</th>
                                            <th style={thStyle}>End Time</th>
                                            <th style={thStyle}>Market</th>
                                            <th style={thStyle}>Assigned To</th>
                                        </tr>
                                    )}
                                    {activeDetail === "active" && (
                                        <tr>
                                            <th style={thStyle}>Worker Name</th>
                                            <th style={thStyle}>Store Name</th>
                                            <th style={thStyle}>Market</th>
                                            <th style={thStyle}>Clocked In</th>
                                            <th style={thStyle}>Shift Ends</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {activeDetail === "jobs" && detailData.map((row: any) => (
                                        <tr key={row.id}>
                                            <td style={tdStyle}>{row.storeName}</td>
                                            <td style={tdStyle}>{row.startTime}</td>
                                            <td style={tdStyle}>{row.endTime}</td>
                                            <td style={tdStyle}>{row.marketName}</td>
                                            <td style={tdStyle}>{row.assignedWorker}</td>
                                        </tr>
                                    ))}
                                    {activeDetail === "active" && detailData.map((row: any) => (
                                        <tr key={row.id}>
                                            <td style={tdStyle}>{row.workerName}</td>
                                            <td style={tdStyle}>{row.storeName}</td>
                                            <td style={tdStyle}>{row.marketName}</td>
                                            <td style={tdStyle}>{formatTime(row.clockIn)}</td>
                                            <td style={tdStyle}>{row.shiftEnd}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
