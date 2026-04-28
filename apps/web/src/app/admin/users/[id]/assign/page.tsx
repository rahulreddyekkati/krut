"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Tab = "current" | "special" | "requested";

export default function AssignJobPage() {
    const params = useParams();
    const userId = params.id as string;
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<Tab>("current");
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [jobs, setJobs] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [selectedJobId, setSelectedJobId] = useState("");
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedStoreId, setSelectedStoreId] = useState("");
    const [stores, setStores] = useState<any[]>([]);
    const [shiftType, setShiftType] = useState<"recurring" | "specific">("recurring");
    const [selectedDate, setSelectedDate] = useState("");

    useEffect(() => {
        fetch(`/api/users/${userId}`)
            .then(r => r.json())
            .then(data => {
                setUser(data);
                const query = data.marketId ? `?marketId=${data.marketId}` : "";
                fetch(`/api/jobs${query}`)
                    .then(r => r.json())
                    .then(jobData => setJobs(jobData))
                    .catch(() => { });
                fetch(`/api/stores${query}`)
                    .then(r => r.json())
                    .then(storeData => setStores(storeData))
                    .catch(() => { });
            })
            .catch(() => { });

        fetchAssignments();
    }, [userId]);

    const availableJobs = [...jobs].sort((a: any, b: any) => a.title.localeCompare(b.title));
    const availableStores = [...stores].sort((a: any, b: any) => a.name.localeCompare(b.name));

    const filteredJobs = selectedStoreId ? availableJobs.filter(j => j.storeId === selectedStoreId) : availableJobs;

    const fetchAssignments = () => {
        fetch(`/api/users/${userId}/assignments`)
            .then(r => r.json())
            .then(data => setAssignments(data))
            .catch(() => { });
    };

    const handleConfirm = async () => {
        if (!selectedJobId) {
            alert("Please select a job.");
            return;
        }

        if (shiftType === "recurring" && selectedDays.length === 0) {
            alert("Please select at least one day for recurring shifts.");
            return;
        }

        if (shiftType === "specific" && !selectedDate) {
            alert("Please select a date.");
            return;
        }

        setIsSaving(true);
        try {
            const payload: any = {
                jobId: selectedJobId,
                isRecurring: shiftType === "recurring"
            };

            if (shiftType === "recurring") {
                payload.weekdays = selectedDays;
            } else {
                payload.date = selectedDate;
            }

            const res = await fetch(`/api/users/${userId}/assignments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowAssignModal(false);
                setSelectedJobId("");
                setSelectedDays([]);
                setSelectedDate("");
                fetchAssignments();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to save assignment.");
            }
        } catch (err) {
            alert("Network error.");
        } finally {
            setIsSaving(false);
        }
    };

    const tabs: { key: Tab; label: string }[] = [
        { key: "current", label: "Current Shifts" },
        { key: "special", label: "Special Shifts" },
        { key: "requested", label: "Requested Shifts" },
    ];

    const daysOfWeek = [
        { id: 1, label: "M", full: "Monday" },
        { id: 2, label: "T", full: "Tuesday" },
        { id: 3, label: "W", full: "Wednesday" },
        { id: 4, label: "T", full: "Thursday" },
        { id: 5, label: "F", full: "Friday" },
        { id: 6, label: "S", full: "Saturday" },
        { id: 0, label: "S", full: "Sunday" },
    ];

    const toggleDay = (dayId: number) => {
        setSelectedDays(prev =>
            prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
        );
    };

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
                {/* Top bar — worker name + back link */}
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
                        <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>
                            Managing shifts for
                        </p>
                        <h1 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, color: "#111827" }}>
                            {user ? user.name : "Loading…"}
                        </h1>
                    </div>
                    <button
                        onClick={() => window.close()}
                        style={{
                            background: "none",
                            border: "1px solid #d1d5db",
                            borderRadius: 6,
                            padding: "0.35rem 0.9rem",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            color: "#374151",
                        }}
                    >
                        ← Back
                    </button>
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
                {activeTab === "current" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", margin: 0 }}>Current Shifts</h2>
                            <button
                                onClick={() => setShowAssignModal(true)}
                                style={{
                                    background: "#6366f1",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "0.6rem 1.2rem",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    boxShadow: "0 2px 4px rgba(99, 102, 241, 0.2)",
                                    transition: "all 0.2s"
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = "#4f46e5"}
                                onMouseOut={(e) => e.currentTarget.style.background = "#6366f1"}
                            >
                                + Assign Job
                            </button>
                        </div>

                        {(() => {
                            const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                            // Group isRecurring assignments by (jobId, weekday derived from date)
                            const groups = new Map<string, { jobId: string; weekday: number; job: any; count: number }>();
                            for (const a of assignments) {
                                if (!a.date) continue;
                                const weekday = new Date(a.date).getUTCDay();
                                const key = `${a.jobId}-${weekday}`;
                                if (!groups.has(key)) {
                                    groups.set(key, { jobId: a.jobId, weekday, job: a.job, count: 0 });
                                }
                                groups.get(key)!.count++;
                            }
                            const groupList = Array.from(groups.values())
                                .sort((a, b) => a.weekday - b.weekday);

                            if (groupList.length === 0) {
                                return (
                                    <div style={{ textAlign: "center", padding: "5rem 1rem", background: "white", borderRadius: "16px", border: "1px dashed #d1d5db" }}>
                                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
                                        <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem" }}>No recurring shifts assigned yet</h3>
                                        <p style={{ color: "#6b7280", margin: 0 }}>Get started by assigning a job to this worker.</p>
                                    </div>
                                );
                            }

                            return (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {groupList.map(group => (
                                        <div key={`${group.jobId}-${group.weekday}`} style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>
                                                    Every {DAY_NAMES[group.weekday]}
                                                </div>
                                                <div style={{ fontWeight: 600, color: "#111827" }}>{group.job?.title}</div>
                                                <div style={{ fontSize: "0.8125rem", color: "#6b7280" }}>
                                                    {group.job?.startTimeStr} – {group.job?.endTimeStr}
                                                    {group.job?.store?.name ? ` · ${group.job.store.name}` : ""}
                                                </div>
                                                <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                                                    {group.count} shift{group.count !== 1 ? "s" : ""} this cycle
                                                </div>
                                            </div>
                                            <button
                                                style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 600, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "0.4rem 0.9rem", cursor: "pointer" }}
                                                onClick={async () => {
                                                    if (!confirm(`Remove all future ${DAY_NAMES[group.weekday]} shifts for this worker?\n\nCompleted past shifts will NOT be deleted.`)) return;
                                                    const res = await fetch(`/api/users/${userId}/assignments?jobId=${group.jobId}&weekday=${group.weekday}`, { method: "DELETE" });
                                                    if (res.ok) fetchAssignments();
                                                }}
                                            >
                                                Remove Pattern
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                )}
                {activeTab === "special" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", margin: 0 }}>Special (Dated) Shifts</h2>
                        </div>

                        {assignments.filter(a => a.date && !a.isRecurring).length === 0 ? (
                            <div style={{ textAlign: "center", padding: "5rem 1rem", background: "white", borderRadius: "16px", border: "1px dashed #d1d5db" }}>
                                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
                                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem" }}>No special shifts</h3>
                                <p style={{ color: "#6b7280", margin: 0 }}>Individual, date-specific shifts will appear here.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {assignments.filter(a => a.date && !a.isRecurring).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(a => (
                                    <div key={a.id} style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6366f1", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                                            {new Date(a.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                                            </div>
                                            <div style={{ fontWeight: 600, color: "#111827" }}>{a.job.title}</div>
                                            <div style={{ fontSize: "0.8125rem", color: "#6b7280" }}>{a.job.startTimeStr} – {a.job.endTimeStr}</div>
                                            {a.clockIn && (
                                                <div style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: 500, marginTop: "0.25rem" }}>
                                                    ✓ Worked: {a.workedHours || 0}h
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
                                            onClick={async () => {
                                                if (!confirm("Are you sure you want to remove this shift?")) return;
                                                await fetch(`/api/users/${userId}/assignments?id=${a.id}`, { method: "DELETE" });
                                                fetchAssignments();
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === "requested" && (
                    <div style={{ color: "#6b7280", padding: "3rem", textAlign: "center" }}>
                        Requested Shifts — coming soon
                    </div>
                )}
            </main>

            {/* ── Assign Job Modal ── */}
            {showAssignModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.4)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    padding: "1rem"
                }}>
                    <div style={{
                        background: "white",
                        width: "100%",
                        maxWidth: "500px",
                        borderRadius: "20px",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column"
                    }}>
                        <div style={{ padding: "1.5rem", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", margin: 0 }}>Assign Job</h2>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#6b7280" }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ padding: "1.5rem 2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            {/* Shift Type Toggle */}
                            <div style={{ display: "flex", background: "#f3f4f6", padding: "0.25rem", borderRadius: "12px", marginBottom: "0.5rem" }}>
                                <button
                                    onClick={() => setShiftType("recurring")}
                                    style={{
                                        flex: 1,
                                        padding: "0.6rem",
                                        borderRadius: "10px",
                                        border: "none",
                                        background: shiftType === "recurring" ? "white" : "transparent",
                                        color: shiftType === "recurring" ? "#111827" : "#6b7280",
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                        cursor: "pointer",
                                        boxShadow: shiftType === "recurring" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    Weekly Recurring
                                </button>
                                <button
                                    onClick={() => setShiftType("specific")}
                                    style={{
                                        flex: 1,
                                        padding: "0.6rem",
                                        borderRadius: "10px",
                                        border: "none",
                                        background: shiftType === "specific" ? "white" : "transparent",
                                        color: shiftType === "specific" ? "#111827" : "#6b7280",
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                        cursor: "pointer",
                                        boxShadow: shiftType === "specific" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    Specific Date
                                </button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "left" }}>
                                <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>Select Store</label>
                                <select
                                    value={selectedStoreId}
                                    onChange={(e) => {
                                        setSelectedStoreId(e.target.value);
                                        setSelectedJobId("");
                                    }}
                                    style={{
                                        padding: "0.75rem",
                                        borderRadius: "10px",
                                        border: "1px solid #d1d5db",
                                        background: "white",
                                        fontSize: "0.9375rem",
                                        color: "#111827",
                                        outline: "none",
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                                    }}
                                >
                                    <option value="">Any Store...</option>
                                    {availableStores.map((store: any) => (
                                        <option key={store.id} value={store.id}>
                                            {store.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "left" }}>
                                <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>Select Job</label>
                                <select
                                    value={selectedJobId}
                                    onChange={(e) => setSelectedJobId(e.target.value)}
                                    style={{
                                        padding: "0.75rem",
                                        borderRadius: "10px",
                                        border: "1px solid #d1d5db",
                                        background: "white",
                                        fontSize: "0.9375rem",
                                        color: "#111827",
                                        outline: "none",
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                        cursor: "default"
                                    }}
                                >
                                    <option value="">{selectedStoreId ? "Choose a job..." : "Choose a job (select a store to filter)..."}</option>
                                    {filteredJobs.map(job => (
                                            <option key={job.id} value={job.id}>
                                                {job.title} ({job.startTimeStr} – {job.endTimeStr}){job.store ? ` — ${job.store.name}` : ''}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {shiftType === "recurring" ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "left" }}>
                                    <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>Select Days (Weekly Recurring)</label>
                                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "space-between" }}>
                                        {daysOfWeek.map(day => {
                                            const isSelected = selectedDays.includes(day.id);
                                            return (
                                                <button
                                                    key={day.id}
                                                    type="button"
                                                    onClick={() => toggleDay(day.id)}
                                                    style={{
                                                        flex: 1,
                                                        height: "45px",
                                                        borderRadius: "10px",
                                                        border: isSelected ? "none" : "1px solid #d1d5db",
                                                        background: isSelected ? "#6366f1" : "white",
                                                        color: isSelected ? "white" : "#374151",
                                                        fontWeight: 600,
                                                        cursor: "pointer",
                                                        transition: "all 0.2s",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "0.875rem",
                                                        boxShadow: isSelected ? "0 4px 6px rgba(99, 102, 241, 0.2)" : "none"
                                                    }}
                                                    title={day.full}
                                                >
                                                    {day.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "left" }}>
                                    <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>Select Date</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        style={{
                                            padding: "0.75rem",
                                            borderRadius: "10px",
                                            border: "1px solid #d1d5db",
                                            background: "white",
                                            fontSize: "0.9375rem",
                                            color: "#111827",
                                            outline: "none",
                                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                            width: "100%"
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{ padding: "1.25rem 1.5rem", background: "#f8f9fb", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                style={{ padding: "0.6rem 1.2rem", borderRadius: "8px", border: "1px solid #d1d5db", background: "white", fontWeight: 600, cursor: "pointer" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isSaving}
                                style={{
                                    padding: "0.6rem 1.2rem",
                                    borderRadius: "8px",
                                    border: "none",
                                    background: isSaving ? "#9ca3af" : "#6366f1",
                                    color: "white",
                                    fontWeight: 600,
                                    cursor: isSaving ? "not-allowed" : "pointer"
                                }}
                            >
                                {isSaving ? "Saving..." : "Confirm Shift"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
