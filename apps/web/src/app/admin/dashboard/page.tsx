"use client";

import { useEffect, useState } from "react";
import PendingRecapsTable from "@/components/admin/PendingRecapsTable";
import { to12hr } from "@/lib/timeFormat";

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
    const [editingShift, setEditingShift] = useState<any>(null);
    const [editTimes, setEditTimes] = useState({ startTime: "", endTime: "" });
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState("");
    const [modalWorkers, setModalWorkers] = useState<any[]>([]);
    const [modalStores, setModalStores] = useState<any[]>([]);
    const [selectedWorkerId, setSelectedWorkerId] = useState("");
    const [selectedStoreId, setSelectedStoreId] = useState("");

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

    const handleOpenShiftEdit = async (row: any) => {
        setEditingShift(row);
        setEditTimes({ startTime: row.startTime === "--" ? "" : row.startTime, endTime: row.endTime === "--" ? "" : row.endTime });
        setSelectedWorkerId(row.workerId || "");
        setSelectedStoreId(row.storeId || "");
        setEditError("");

        // Fetch workers and stores for this market
        const [workersRes, storesRes] = await Promise.all([
            fetch("/api/users/workers"),
            fetch(`/api/stores${row.marketId ? `?marketId=${row.marketId}` : ""}`)
        ]);
        if (workersRes.ok) {
            const data = await workersRes.json();
            const workers = Array.isArray(data) ? data : (data.workers || []);
            setModalWorkers(row.marketId ? workers.filter((w: any) => w.marketId === row.marketId) : workers);
        }
        if (storesRes.ok) {
            setModalStores(await storesRes.json());
        }
    };

    const handleSaveShiftEdit = async () => {
        if (!editingShift?.assignmentId) return;
        setEditSaving(true);
        try {
            const workerChanged = selectedWorkerId && selectedWorkerId !== editingShift.workerId;
            const storeChanged  = selectedStoreId  && selectedStoreId  !== editingShift.storeId;
            const timeChanged   = editTimes.startTime || editTimes.endTime;

            // Use the new full-reassignment endpoint if worker or store changed
            const useReassignEndpoint = workerChanged || storeChanged;
            const url = useReassignEndpoint
                ? `/api/admin/assignments/${editingShift.assignmentId}`
                : `/api/users/${editingShift.workerId}/assignments`;

            const body = useReassignEndpoint
                ? {
                    newWorkerId: workerChanged ? selectedWorkerId : undefined,
                    storeId:     storeChanged  ? selectedStoreId  : undefined,
                    startTimeStr: editTimes.startTime || undefined,
                    endTimeStr:   editTimes.endTime   || undefined,
                }
                : {
                    assignmentId: editingShift.assignmentId,
                    customStartTimeStr: editTimes.startTime || null,
                    customEndTimeStr:   editTimes.endTime   || null,
                };

            const res = await fetch(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                setEditingShift(null);
                fetchDetailData("jobs");
            } else {
                const d = await res.json();
                setEditError(d.error || "Failed to save");
            }
        } catch {
            setEditError("An unexpected error occurred");
        } finally {
            setEditSaving(false);
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
                                            <th style={thStyle}>Break Time</th>
                                            <th style={thStyle}>Edit</th>
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
                                    {activeDetail === "jobs" && detailData.map((row: any, i: number) => (
                                        <tr key={`${row.id}-${i}`}>
                                            <td style={tdStyle}>{row.storeName}</td>
                                            <td style={tdStyle}>
                                                {to12hr(row.startTime)}
                                                {row.hasCustomTimes && <span style={{ marginLeft: "0.35rem", fontSize: "0.65rem", color: "#6366f1", fontWeight: 700 }}>★</span>}
                                            </td>
                                            <td style={tdStyle}>
                                                {to12hr(row.endTime)}
                                                {row.hasCustomTimes && <span style={{ marginLeft: "0.35rem", fontSize: "0.65rem", color: "#6366f1", fontWeight: 700 }}>★</span>}
                                            </td>
                                            <td style={tdStyle}>{row.marketName}</td>
                                            <td style={tdStyle}>{row.assignedWorker}</td>
                                            <td style={tdStyle}>{row.breakTimeMinutes > 0 ? `${row.breakTimeMinutes}m` : "—"}</td>
                                            <td style={tdStyle}>
                                                {row.assignmentId ? (
                                                    <button
                                                        onClick={() => handleOpenShiftEdit(row)}
                                                        style={{ background: "#6366f1", color: "white", border: "none", borderRadius: "6px", padding: "0.25rem 0.75rem", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
                                                    >
                                                        Edit
                                                    </button>
                                                ) : (
                                                    <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>—</span>
                                                )}
                                            </td>
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
        {editingShift && (
            <div
                onClick={() => setEditingShift(null)}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
                <div
                    onClick={e => e.stopPropagation()}
                    className="card glass"
                    style={{ width: "100%", maxWidth: "420px", padding: "1.75rem", borderRadius: "1rem" }}
                >
                    <h3 className="heading h4" style={{ marginBottom: "0.25rem" }}>Edit Shift</h3>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1.5rem" }}>
                        {editingShift.storeName} · {editingShift.marketName}
                    </p>

                    {/* Worker */}
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Assigned Worker</label>
                        <select
                            className="input"
                            value={selectedWorkerId}
                            onChange={e => setSelectedWorkerId(e.target.value)}
                        >
                            <option value="">— Unassigned —</option>
                            {modalWorkers.map((w: any) => (
                                <option key={w.id} value={w.id}>{w.name || w.email}</option>
                            ))}
                        </select>
                    </div>

                    {/* Store */}
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Store</label>
                        <select
                            className="input"
                            value={selectedStoreId}
                            onChange={e => setSelectedStoreId(e.target.value)}
                        >
                            {modalStores.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Times */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>Start Time</label>
                            <input
                                type="time"
                                className="input"
                                value={editTimes.startTime}
                                onChange={e => setEditTimes(t => ({ ...t, startTime: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>End Time</label>
                            <input
                                type="time"
                                className="input"
                                value={editTimes.endTime}
                                onChange={e => setEditTimes(t => ({ ...t, endTime: e.target.value }))}
                            />
                        </div>
                    </div>

                    {editError && <div className="alert alert-danger" style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>{editError}</div>}

                    <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                        <button onClick={() => setEditingShift(null)} style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", padding: "0.5rem 1rem", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                        <button
                            onClick={handleSaveShiftEdit}
                            disabled={editSaving}
                            className="btn btn-primary"
                        >
                            {editSaving ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
}
