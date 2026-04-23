"use client";

import { useEffect, useState } from "react";
import PendingRecapsTable from "@/components/admin/PendingRecapsTable";

export default function RecapsPage() {
    const [activeTab, setActiveTab] = useState(0); // 0: Pending, 1: Incomplete, 2: Reviewed
    
    // Tab 1 Data
    const [pendingRecaps, setPendingRecaps] = useState<any[]>([]);
    const [loadingPending, setLoadingPending] = useState(true);

    // Tab 2 Data
    const [incompleteRecaps, setIncompleteRecaps] = useState<any[]>([]);
    const [loadingIncomplete, setLoadingIncomplete] = useState(true);
    const [sentReminders, setSentReminders] = useState<Record<string, boolean>>({});

    // Tab 3 Data
    const [reviewedRecaps, setReviewedRecaps] = useState<any[]>([]);
    const [loadingReviewed, setLoadingReviewed] = useState(true);
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    });

    const fetchPending = async () => {
        setLoadingPending(true);
        try {
            const res = await fetch(`/api/admin/recaps?status=PENDING&noLimit=true`);
            if (res.ok) {
                const data = await res.json();
                // order oldest first
                const sorted = (data.recaps || []).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                setPendingRecaps(sorted);
            }
        } catch (e) {
            console.error("Failed to fetch pending recaps", e);
        }
        setLoadingPending(false);
    };

    const fetchIncomplete = async () => {
        setLoadingIncomplete(true);
        try {
            const res = await fetch(`/api/admin/recaps/incomplete`);
            if (res.ok) {
                const data = await res.json();
                setIncompleteRecaps(data.incomplete || []);
            }
        } catch (e) {
            console.error("Failed to fetch incomplete recaps", e);
        }
        setLoadingIncomplete(false);
    };

    const fetchReviewed = async (date: string) => {
        setLoadingReviewed(true);
        try {
            const res = await fetch(`/api/admin/recaps?status=APPROVED,REJECTED&date=${date}`);
            if (res.ok) {
                const data = await res.json();
                setReviewedRecaps(data.recaps || []);
            }
        } catch (e) {
            console.error("Failed to fetch reviewed recaps", e);
        }
        setLoadingReviewed(false);
    };

    useEffect(() => {
        if (activeTab === 0) fetchPending();
        if (activeTab === 1) fetchIncomplete();
        if (activeTab === 2) fetchReviewed(selectedDate);
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 2) fetchReviewed(selectedDate);
    }, [selectedDate]);

    const statusBadge = (status: string) => {
        const colors: any = {
            PENDING: { bg: "#fef3c7", color: "#92400e", label: "Pending" },
            APPROVED: { bg: "#d1fae5", color: "#065f46", label: "Approved" },
            REJECTED: { bg: "#fee2e2", color: "#991b1b", label: "Rejected" }
        };
        const s = colors[status] || colors.PENDING;
        return (
            <span style={{
                padding: "0.25rem 0.75rem",
                borderRadius: "99px",
                fontSize: "0.7rem",
                fontWeight: 700,
                background: s.bg,
                color: s.color,
                textTransform: "uppercase",
                letterSpacing: "0.03em"
            }}>
                {s.label}
            </span>
        );
    };

    const getRelativeTime = (isoString: string) => {
        if (!isoString) return "Unknown";
        const ms = new Date().getTime() - new Date(isoString).getTime();
        const mins = Math.floor(ms / 60000);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (mins > 0) return `${mins} min${mins > 1 ? 's' : ''} ago`;
        return "Just now";
    };

    const thStyle: React.CSSProperties = {
        textAlign: "left",
        padding: "0.75rem 1rem",
        borderBottom: "2px solid #e5e7eb",
        fontWeight: 700,
        color: "#6b7280",
        fontSize: "11px",
        textTransform: "uppercase",
        letterSpacing: "0.03em"
    };

    const tdStyle: React.CSSProperties = {
        padding: "0.75rem 1rem",
        borderBottom: "1px solid #f3f4f6",
        color: "#111827",
        fontSize: "0.875rem"
    };

    return (
        <div style={{ paddingBottom: '3rem' }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 className="heading h2" style={{ color: '#111827' }}>Recaps</h1>
                    <p className="text-secondary" style={{ color: '#6b7280' }}>Review and approve submitted worker recaps.</p>
                </div>
            </div>

            {/* TABS */}
            <div style={{ display: "flex", gap: "2rem", borderBottom: "1px solid #e5e7eb", marginTop: "1.5rem" }}>
                {[
                    { label: "Pending Review", count: pendingRecaps.length },
                    { label: "Incomplete", count: incompleteRecaps.length },
                    { label: "Reviewed", count: 0 }
                ].map((tab, i) => (
                    <div
                        key={i}
                        onClick={() => setActiveTab(i)}
                        style={{
                            padding: "0.75rem 0",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontWeight: activeTab === i ? 700 : 500,
                            color: activeTab === i ? "#6366f1" : "#6b7280",
                            borderBottom: activeTab === i ? "2px solid #6366f1" : "2px solid transparent",
                            marginBottom: "-1px",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                        }}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span style={{
                                background: i === 1 ? "#f59e0b" : "#6366f1",
                                color: "white",
                                fontSize: "0.7rem",
                                padding: "0.1rem 0.5rem",
                                borderRadius: "10px",
                                fontWeight: 700
                            }}>
                                {tab.count}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* TAB CONTENT: PENDING */}
            {activeTab === 0 && (
                <div className="card" style={{ marginTop: "1.5rem", overflow: "hidden", background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                    {loadingPending ? (
                        <p style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>Loading pending recaps...</p>
                    ) : pendingRecaps.length === 0 ? (
                        <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
                            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: "0.25rem" }}>All caught up!</h3>
                            <p style={{ color: "#6b7280" }}>No recaps are currently waiting for your review.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>Employee Name</th>
                                        <th style={thStyle}>Store Name</th>
                                        <th style={thStyle}>Market</th>
                                        <th style={thStyle}>Shift Date</th>
                                        <th style={thStyle}>Submitted</th>
                                        <th style={thStyle}>Reimbursement</th>
                                        <th style={thStyle}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingRecaps.map((r: any) => (
                                        <tr key={r.id}>
                                            <td style={tdStyle}><div style={{ fontWeight: 600 }}>{r.workerName}</div></td>
                                            <td style={tdStyle}>{r.storeName}</td>
                                            <td style={tdStyle}>{r.marketName}</td>
                                            <td style={tdStyle}>{r.startTime ? new Date(r.startTime).toLocaleDateString() : '—'}</td>
                                            <td style={tdStyle}>{getRelativeTime(r.createdAt)}</td>
                                            <td style={tdStyle}>${(r.reimbursement || 0).toFixed(2)}</td>
                                            <td style={tdStyle}>
                                                <a
                                                    href={`/admin/recaps/${r.id}`}
                                                    className="btn-primary"
                                                    style={{
                                                        padding: "0.375rem 1rem",
                                                        background: "#6366f1",
                                                        color: "white",
                                                        borderRadius: "8px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: 700,
                                                        textDecoration: "none"
                                                    }}
                                                >
                                                    View
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: INCOMPLETE */}
            {activeTab === 1 && (
                <div className="card" style={{ marginTop: "1.5rem", overflow: "hidden", background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                    {loadingIncomplete ? (
                        <p style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>Loading incomplete assignments...</p>
                    ) : incompleteRecaps.length === 0 ? (
                        <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
                            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎉</div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: "0.25rem" }}>All recaps submitted!</h3>
                            <p style={{ color: "#6b7280" }}>Every worker has submitted their recap for current shifts.</p>
                        </div>
                    ) : (
                        <PendingRecapsTable recaps={incompleteRecaps} />
                    )}
                </div>
            )}

            {/* TAB CONTENT: REVIEWED */}
            {activeTab === 2 && (
                <>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
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
                    <div className="card" style={{ marginTop: "1rem", overflow: "hidden", background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                        {loadingReviewed ? (
                            <p style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>Loading reviewed recaps...</p>
                        ) : reviewedRecaps.length === 0 ? (
                            <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
                                <p style={{ color: "#9ca3af", fontSize: "0.95rem" }}>No reviewed recaps found for this date.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            <th style={thStyle}>Employee Name</th>
                                            <th style={thStyle}>Store Name</th>
                                            <th style={thStyle}>Market</th>
                                            <th style={thStyle}>Shift Date</th>
                                            <th style={thStyle}>Status</th>
                                            <th style={thStyle}>Reimbursement</th>
                                            <th style={thStyle}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reviewedRecaps.map((r: any) => (
                                            <tr key={r.id}>
                                                <td style={tdStyle}><div style={{ fontWeight: 600 }}>{r.workerName}</div></td>
                                                <td style={tdStyle}>{r.storeName}</td>
                                                <td style={tdStyle}>{r.marketName}</td>
                                                <td style={tdStyle}>{r.startTime ? new Date(r.startTime).toLocaleDateString() : '—'}</td>
                                                <td style={tdStyle}>{statusBadge(r.status)}</td>
                                                <td style={tdStyle}>${(r.reimbursement || 0).toFixed(2)}</td>
                                                <td style={tdStyle}>
                                                    <a
                                                        href={`/admin/recaps/${r.id}`}
                                                        style={{
                                                            padding: "0.375rem 1rem",
                                                            background: "#6366f1",
                                                            color: "white",
                                                            borderRadius: "8px",
                                                            fontSize: "0.75rem",
                                                            fontWeight: 700,
                                                            textDecoration: "none"
                                                        }}
                                                    >
                                                        View
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
