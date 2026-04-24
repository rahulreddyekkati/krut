"use client";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";

export default function ReleasedShiftsPage() {
    const [releases, setReleases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedRelease, setSelectedRelease] = useState<any>(null);
    const [workers, setWorkers] = useState<any[]>([]);
    const [selectedWorkerId, setSelectedWorkerId] = useState("");
    const [assignLoading, setAssignLoading] = useState(false);
    const [workersLoading, setWorkersLoading] = useState(false);

    useEffect(() => {
        async function fetchUnassignedReleases() {
            try {
                const res = await fetch("/api/admin/released-shifts");
                if (res.ok) {
                    setReleases(await res.json());
                }
            } catch (e) {
                console.error("Failed to load released shifts", e);
            } finally {
                setLoading(false);
            }
        }
        fetchUnassignedReleases();
    }, []);

    // Fetch workers when modal opens
    useEffect(() => {
        if (isAssignModalOpen && selectedRelease) {
            setWorkersLoading(true);
            // Use /users/workers — already scoped to market, returns only WORKERs
            fetch(`/api/users/workers`)
                .then(res => res.json())
                .then(data => {
                    const marketWorkers = (data || []).filter((u: any) =>
                        u.marketId === selectedRelease.job.marketId
                    );
                    setWorkers(marketWorkers);
                })
                .catch(e => console.error("Failed to fetch workers", e))
                .finally(() => setWorkersLoading(false));
        }
    }, [isAssignModalOpen, selectedRelease]);

    const openAssignModal = (release: any) => {
        setSelectedRelease(release);
        setSelectedWorkerId("");
        setIsAssignModalOpen(true);
    };

    const handleAssign = async () => {
        if (!selectedWorkerId) return alert("Please select a worker first.");
        setAssignLoading(true);
        try {
            const res = await fetch("/api/admin/released-shifts/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    openJobId: selectedRelease.openJobId,
                    workerId: selectedWorkerId,
                    date: selectedRelease.date
                })
            });
            if (res.ok) {
                setIsAssignModalOpen(false);
                // Remove the assigned shift from the list
                setReleases(prev => prev.filter(r => r.id !== selectedRelease.id));
            } else {
                const data = await res.json();
                alert(data.error || "Failed to assign shift");
            }
        } catch (e) {
            alert("Network error occurred while assigning shift");
        } finally {
            setAssignLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "Inter, sans-serif" }}>
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
                            Released Shifts
                        </h1>
                        <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
                            Approved shift releases that have not yet been picked up by another worker.
                        </p>
                    </div>
                </div>
            </nav>

            <main style={{ maxWidth: 960, margin: "2rem auto", padding: "0 1.5rem", paddingBottom: "4rem" }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading unassigned releases...</div>
                ) : releases.length === 0 ? (
                    <div className="card glass animate-fade-in" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                <polyline points="9 12 11 14 15 10"></polyline>
                            </svg>
                        </div>
                        <h2 className="heading h3">All Good!</h2>
                        <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0.5rem auto 0 auto' }}>
                            There are currently no open released shifts. All approved releases have been picked up.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: '2rem' }}>
                        {releases.map(release => (
                            <div key={release.id} className="animate-fade-in" style={{
                                background: "white",
                                borderRadius: "12px",
                                padding: "1.5rem",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                borderLeft: "4px solid #f59e0b",
                                display: "flex",
                                flexDirection: "column"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                                    <h3 style={{ margin: 0, fontSize: "1.125rem", color: "#111827", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                                        {release.job.title.split(' - ')[0]} 
                                        <span style={{ color: "#b91c1c", fontSize: "0.75rem", fontWeight: 600, padding: "0.2rem 0.6rem", background: "#fee2e2", borderRadius: "12px" }}>
                                            Released by {release.worker.name}
                                        </span>
                                    </h3>
                                </div>
                                <div style={{ color: "#4b5563", fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                        <strong>Store:</strong> {release.job.store.name}
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        <strong>Date:</strong> {release.date ? new Date(release.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : "Recurring"}
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                        <strong>Time:</strong> {release.job.startTimeStr} - {release.job.endTimeStr}
                                    </span>
                                    
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem", borderTop: "1px solid #f3f4f6", paddingTop: "1rem" }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#d97706", fontWeight: 500 }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                            Status: Waiting for new worker
                                        </span>
                                        <button 
                                            onClick={() => openAssignModal(release)}
                                            style={{ 
                                                background: "#4f46e5", 
                                                color: "white", 
                                                border: "none", 
                                                padding: "0.5rem 1rem", 
                                                borderRadius: "8px", 
                                                cursor: "pointer", 
                                                fontWeight: 500,
                                                fontSize: "0.875rem",
                                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                                            }}
                                        >
                                            Assign Shift
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Assignment Modal */}
            {isAssignModalOpen && selectedRelease && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 999
                }} onClick={() => setIsAssignModalOpen(false)}>
                    <div style={{
                        background: "white", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "450px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#111827" }}>Assign Shift</h2>
                            <button onClick={() => setIsAssignModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                            <p style={{ margin: "0 0 0.25rem 0", fontWeight: 600, color: "#374151" }}>{selectedRelease.job.store.name}</p>
                            <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.875rem", color: "#4b5563" }}>
                                {selectedRelease.date ? new Date(selectedRelease.date).toLocaleDateString() : "Recurring"} • {selectedRelease.job.startTimeStr} - {selectedRelease.job.endTimeStr}
                            </p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>Select Worker to Assign</label>
                            {workersLoading ? (
                                <div style={{ padding: "0.75rem", background: "#f3f4f6", borderRadius: "8px", color: "#6b7280", fontSize: "0.875rem" }}>
                                    Loading workers in market...
                                </div>
                            ) : (
                                <select 
                                    value={selectedWorkerId}
                                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                                    style={{
                                        width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #d1d5db",
                                        background: "white", fontSize: "0.875rem", color: "#111827"
                                    }}
                                >
                                    <option value="">-- Choose a worker --</option>
                                    {workers.map(worker => (
                                        <option key={worker.id} value={worker.id}>
                                            {worker.name} ({worker.email})
                                        </option>
                                    ))}
                                </select>
                            )}
                            {workers.length === 0 && !workersLoading && (
                                <p style={{ fontSize: "0.75rem", color: "#ef4444", margin: "0.25rem 0 0 0" }}>
                                    No workers found in this market.
                                </p>
                            )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "2rem" }}>
                            <button 
                                onClick={() => setIsAssignModalOpen(false)}
                                style={{
                                    padding: "0.6rem 1rem", border: "1px solid #d1d5db", background: "white", color: "#374151",
                                    borderRadius: "8px", fontWeight: 500, cursor: "pointer", fontSize: "0.875rem"
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleAssign}
                                disabled={assignLoading || !selectedWorkerId}
                                style={{
                                    padding: "0.6rem 1.25rem", border: "none", background: assignLoading || !selectedWorkerId ? "#9ca3af" : "#4f46e5", color: "white",
                                    borderRadius: "8px", fontWeight: 500, cursor: assignLoading || !selectedWorkerId ? "not-allowed" : "pointer", fontSize: "0.875rem",
                                    transition: "background 0.2s"
                                }}
                            >
                                {assignLoading ? "Assigning..." : "Assign Shift"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
