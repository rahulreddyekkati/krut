"use client";

import { useEffect, useState } from "react";

export default function RecapsPage() {
    const [recaps, setRecaps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

    const fetchRecaps = async (date: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/recaps?date=${date}`);
            if (res.ok) {
                const data = await res.json();
                setRecaps(data.recaps || []);
            }
        } catch (e) {
            console.error("Failed to fetch recaps", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRecaps(selectedDate);
    }, [selectedDate]);

    const statusBadge = (status: string) => {
        const colors: any = {
            PENDING: { bg: "#fef3c7", color: "#92400e", label: "Pending" },
            APPROVED: { bg: "#d1fae5", color: "#065f46", label: "Approved" },
            REJECTED: { bg: "#fce4ec", color: "#b71c1c", label: "Rejected" }
        };
        const s = colors[status] || colors.PENDING;
        return (
            <span style={{
                padding: "0.25rem 0.75rem",
                borderRadius: "999px",
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

    const thStyle: React.CSSProperties = {
        textAlign: "left",
        padding: "0.75rem 1rem",
        borderBottom: "2px solid #e5e7eb",
        fontWeight: 700,
        color: "#374151",
        fontSize: "0.7rem",
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
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 className="heading h2">Recaps</h1>
                    <p className="text-secondary">Review and approve submitted recaps.</p>
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

            <div className="card glass" style={{ marginTop: "1.5rem", overflow: "hidden" }}>
                {loading ? (
                    <p style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>Loading...</p>
                ) : recaps.length === 0 ? (
                    <p style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>No recaps found for this date.</p>
                ) : (
                    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Employee Name</th>
                                    <th style={thStyle}>Store Name</th>
                                    <th style={thStyle}>Market</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Reimbursement</th>
                                    <th style={thStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recaps.map((recap: any) => (
                                    <tr key={recap.id}>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: 600 }}>{recap.workerName}</div>
                                        </td>
                                        <td style={tdStyle}>{recap.storeName}</td>
                                        <td style={tdStyle}>{recap.marketName}</td>
                                        <td style={tdStyle}>{statusBadge(recap.status)}</td>
                                        <td style={tdStyle}>${(recap.reimbursement || 0).toFixed(2)}</td>
                                        <td style={tdStyle}>
                                            <a
                                                href={`/admin/recaps/${recap.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    padding: "0.375rem 1rem",
                                                    background: "#6366f1",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "8px",
                                                    fontSize: "0.75rem",
                                                    fontWeight: 700,
                                                    cursor: "pointer",
                                                    textDecoration: "none",
                                                    display: "inline-block"
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
        </div>
    );
}
