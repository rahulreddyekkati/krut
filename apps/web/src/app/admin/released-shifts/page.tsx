"use client";

import { useState, useEffect } from "react";

export default function ReleasedShiftsPage() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState<string | null>(null);
    const [workers, setWorkers] = useState<any[]>([]);
    const [selectedWorker, setSelectedWorker] = useState<Record<string, string>>({});

    useEffect(() => {
        fetch("/api/admin/released-shifts")
            .then(r => r.json())
            .then(d => setAssignments(Array.isArray(d) ? d : []))
            .catch(() => {})
            .finally(() => setLoading(false));

        fetch("/api/users/workers")
            .then(r => r.json())
            .then(d => setWorkers(Array.isArray(d) ? d : []))
            .catch(() => {});
    }, []);

    const handleDirectAssign = async (assignment: any) => {
        const workerId = selectedWorker[assignment.id];
        if (!workerId) return alert("Select a worker first");
        setAssigning(assignment.id);
        try {
            // Approve a new shift request on behalf of this worker
            const reqRes = await fetch("/api/jobs/actions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "ACCEPT", assignmentId: assignment.id })
            });
            // That API only works for the logged-in worker.
            // Admin direct-assign: use PATCH on the assignment to change workerId
            const res = await fetch(`/api/users/${workerId}/assignments`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assignmentId: assignment.id,
                    directAssign: true,
                    newWorkerId: workerId
                })
            });
            if (res.ok) {
                setAssignments(prev => prev.filter(a => a.id !== assignment.id));
                alert("Shift assigned successfully");
            } else {
                const d = await res.json();
                alert(d.error || "Failed to assign");
            }
        } catch {
            alert("Network error");
        } finally {
            setAssigning(null);
        }
    };

    return (
        <div>
            <h1 className="heading h2">Released Shifts</h1>
            <p className="text-secondary" style={{ marginBottom: "2rem" }}>
                Shifts released by workers that are waiting for a new worker to pick them up.
            </p>

            {loading ? (
                <p style={{ color: "#9ca3af" }}>Loading...</p>
            ) : assignments.length === 0 ? (
                <div className="card glass" style={{ padding: "3rem", textAlign: "center" }}>
                    <p style={{ color: "#9ca3af", fontSize: "1rem" }}>No released shifts available.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {assignments.map(a => {
                        const dateStr = a.date
                            ? new Date(a.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
                            : "—";
                        const marketWorkers = workers.filter(w => w.marketId === a.job?.market?.id);
                        return (
                            <div key={a.id} className="card glass" style={{ borderLeft: "4px solid #f59e0b" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 0.25rem" }}>
                                            {a.job?.store?.name} · {dateStr}
                                        </p>
                                        <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0 0 0.25rem" }}>
                                            {a.job?.startTimeStr} – {a.job?.endTimeStr} · {a.job?.market?.name}
                                        </p>
                                        <p style={{ color: "#b45309", fontSize: "0.8rem", margin: 0 }}>
                                            Released by: {a.worker?.name}
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <select
                                            value={selectedWorker[a.id] || ""}
                                            onChange={e => setSelectedWorker(prev => ({ ...prev, [a.id]: e.target.value }))}
                                            style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "0.875rem" }}
                                        >
                                            <option value="">Select worker...</option>
                                            {marketWorkers.map(w => (
                                                <option key={w.id} value={w.id}>{w.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handleDirectAssign(a)}
                                            disabled={assigning === a.id || !selectedWorker[a.id]}
                                            style={{
                                                padding: "0.5rem 1rem", background: "#4f46e5", color: "white",
                                                border: "none", borderRadius: "8px", fontWeight: 600,
                                                cursor: "pointer", fontSize: "0.875rem",
                                                opacity: assigning === a.id || !selectedWorker[a.id] ? 0.6 : 1
                                            }}
                                        >
                                            {assigning === a.id ? "Assigning..." : "Assign"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
