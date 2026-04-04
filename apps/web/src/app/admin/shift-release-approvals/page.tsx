"use client";

import { useState, useEffect, useCallback } from "react";

type Tab = "release-requests" | "assign-requests";

export default function ShiftReleaseApprovalsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("release-requests");
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === "release-requests" 
                ? "/api/admin/shift-release-requests"
                : "/api/admin/shift-assign-requests";
            const res = await fetch(endpoint);
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const tabs: { key: Tab; label: string }[] = [
        { key: "release-requests", label: "Shift Release Requests" },
        { key: "assign-requests", label: "Shift Assign Requests" },
    ];

    const handleAction = async (id: string, action: "approve" | "reject") => {
        try {
            const baseEndpoint = activeTab === "release-requests"
                ? "/api/admin/shift-release-requests"
                : "/api/admin/shift-assign-requests";
            
            const res = await fetch(`${baseEndpoint}/${id}/${action}`, {
                method: "POST"
            });
            if (res.ok) {
                // Optimistically remove from list
                setRequests(prev => prev.filter(req => req.id !== id));
            } else {
                alert(`Failed to ${action} request`);
            }
        } catch (error) {
            console.error(error);
            alert("Network error");
        }
    };

    const renderRequestCard = (req: any, type: Tab) => (
        <div key={req.id} style={{
            background: "white",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem"
        }}>
            <div>
                <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem", color: "#111827" }}>
                    {req.worker.name} <span style={{ color: "#6b7280", fontSize: "0.875rem", fontWeight: 400 }}>
                        {type === "release-requests" ? "requests to release shift" : "requests to accept shift"}
                    </span>
                </h3>
                <div style={{ color: "#4b5563", fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span><strong>Store:</strong> {req.job.store.name}</span>
                    <span><strong>Market:</strong> {req.job.market.name}</span>
                    <span><strong>Date:</strong> {req.date ? new Date(req.date).toLocaleDateString() : "Recurring Default"}</span>
                    <span><strong>Time:</strong> {req.job.startTimeStr} - {req.job.endTimeStr}</span>
                </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
                <button 
                    onClick={() => handleAction(req.id, "reject")}
                    style={{ background: "#ef4444", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontWeight: 500 }}
                >
                    Reject
                </button>
                <button 
                    onClick={() => handleAction(req.id, "approve")}
                    style={{ background: "#10b981", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontWeight: 500 }}
                >
                    Approve
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "Inter, sans-serif" }}>
            {/* ── Navbar ── */}
            <nav style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                margin: "2rem 1.5rem 0",
                boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
                overflow: "hidden",
                position: "sticky",
                top: "1.5rem",
                zIndex: 100
            }}>
                {/* Top bar */}
                <div style={{
                    maxWidth: 960,
                    margin: "0 auto",
                    padding: "0 1.5rem",
                    height: 60,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}>
                    <div>
                        <h1 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, color: "#111827" }}>
                            Shift Requests
                        </h1>
                    </div>
                </div>

                {/* Tab nav */}
                <div style={{
                    maxWidth: 960,
                    margin: "0 auto",
                    padding: "0 1.5rem",
                    display: "flex",
                    gap: "0.25rem",
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: "0.65rem 1.25rem",
                                border: "none",
                                borderBottom: activeTab === tab.key
                                    ? "2px solid #6366f1"
                                    : "2px solid transparent",
                                background: "none",
                                cursor: "pointer",
                                fontSize: "0.875rem",
                                fontWeight: activeTab === tab.key ? 600 : 400,
                                color: activeTab === tab.key ? "#6366f1" : "#6b7280",
                                transition: "all 0.15s",
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </nav>

            {/* ── Tab Content ── */}
            <main style={{ maxWidth: 960, margin: "2rem auto", padding: "0 1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {loading && <p>Loading requests...</p>}
                    {!loading && requests.length === 0 && (
                        <div style={{ color: "#6b7280", padding: "3rem", textAlign: "center", background: "white", borderRadius: "16px", border: "1px dashed #d1d5db" }}>
                            No pending {activeTab.replace("-", " ")} found.
                        </div>
                    )}
                    {!loading && requests.map(req => renderRequestCard(req, activeTab))}
                </div>
            </main>
        </div>
    );
}
