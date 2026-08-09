"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./jobs.module.css";

interface Job {
    id: string;
    title: string;
    startTimeStr: string; // HH:MM
    endTimeStr: string;   // HH:MM
    date?: string;
    bonus: number;
    status: string;
    store: { name: string; address: string };
    marketId: string;
    market: { name: string };
    assignments: Array<{ status: string; worker: { name: string; email: string } }>;
}

interface Market {
    id: string;
    name: string;
}

interface Store {
    id: string;
    name: string;
    marketId: string;
}

interface ShiftByDate {
    id: string;
    jobId: string;
    assignmentId: string | null;
    workerId: string | null;
    status: string | null;
    requestedWorkerId: string | null;
    storeName: string;
    storeId: string;
    startTime: string;
    endTime: string;
    marketName: string;
    marketId: string | null;
    assignedWorker: string;
    date: string | null;
}

interface Worker {
    id: string;
    name: string;
    email: string;
    marketId: string | null;
}

// Composite key for row selection/busy-state maps: assignmentId when the row already
// has one, else a jobId+date pair (Unassigned rows have no assignmentId).
const rowKey = (shift: ShiftByDate) => shift.assignmentId ?? `${shift.jobId}-${shift.date ?? "recurring"}`;

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [markets, setMarkets] = useState<Market[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [filteredStores, setFilteredStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedMarket, setSelectedMarket] = useState<string>("all");
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [editTimes, setEditTimes] = useState({ startTime: "", endTime: "" });
    const [editSaving, setEditSaving] = useState(false);
    const [editInProgressWorkers, setEditInProgressWorkers] = useState<string[]>([]);

    const [activeTab, setActiveTab] = useState<"all" | "byDate">("all");
    const [selectedStore, setSelectedStore] = useState<string>("all");
    const [shiftsByDate, setShiftsByDate] = useState<ShiftByDate[]>([]);
    const [loadingByDate, setLoadingByDate] = useState(false);

    // By Date: bulk/per-row targeted "Request" and "Assign"
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [selectedRows, setSelectedRows] = useState<Map<string, ShiftByDate>>(new Map());
    const [bulkWorkerId, setBulkWorkerId] = useState("");
    const [bulkBusy, setBulkBusy] = useState(false);
    const [perRowWorkerId, setPerRowWorkerId] = useState<Record<string, string>>({});
    const [rowBusy, setRowBusy] = useState<Record<string, "assign" | "request" | undefined>>({});

    const [formData, setFormData] = useState({
        title: "",
        marketId: "",
        storeId: "",
        startTime: "",
        endTime: "",
        bonus: "0",
        isRecurring: true,
        date: "",
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchByDate = async () => {
        setLoadingByDate(true);
        try {
            // scope=upcoming: only specific-date jobs (not recurring templates), today or later.
            const res = await fetch(`/api/admin/dashboard-details?type=jobs&scope=upcoming`, {
                headers: {
                    "x-timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
                    "x-timezone-offset": new Date().getTimezoneOffset().toString()
                }
            });
            if (res.ok) {
                const { data } = await res.json();
                setShiftsByDate(data || []);
            }
        } catch (err) {
            setError("Failed to fetch shifts");
        } finally {
            setLoadingByDate(false);
        }
    };

    useEffect(() => {
        if (activeTab !== "byDate") return;
        fetchByDate();
        if (workers.length === 0) {
            fetch("/api/users/workers")
                .then(r => r.json())
                .then(d => setWorkers(Array.isArray(d) ? d : []))
                .catch(() => {});
        }
    }, [activeTab]);

    // Switching markets can leave selectedStore pointing at a store that doesn't
    // belong to the new market (or doesn't exist in its dropdown options at all) --
    // reset back to "all" so the table doesn't silently show an empty/stale result.
    useEffect(() => {
        setSelectedStore("all");
    }, [selectedMarket]);

    // When market changes, filter stores
    useEffect(() => {
        if (formData.marketId) {
            setFilteredStores(stores.filter(s => s.marketId === formData.marketId));
            setFormData(prev => ({ ...prev, storeId: "" }));
        } else {
            setFilteredStores(stores);
        }
    }, [formData.marketId, stores]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [jobsRes, marketsRes, storesRes] = await Promise.all([
                fetch("/api/jobs"),
                fetch("/api/markets"),
                fetch("/api/stores"),
            ]);
            if (jobsRes.ok) setJobs(await jobsRes.json());
            if (marketsRes.ok) setMarkets(await marketsRes.json());
            if (storesRes.ok) {
                const allStores = await storesRes.json();
                setStores(allStores);
                setFilteredStores(allStores);
            }
        } catch (err) {
            setError("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.title.trim()) {
            setError("Job Name is required");
            return;
        }
        if (!formData.marketId) {
            setError("Please select a market");
            return;
        }
        if (!formData.storeId) {
            setError("Please select a store");
            return;
        }

        try {
            const res = await fetch("/api/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title.trim(),
                    storeId: formData.storeId,
                    startTime: formData.startTime, // raw "HH:MM" — no date
                    endTime: formData.endTime,
                    bonus: formData.bonus,
                    date: formData.isRecurring ? null : formData.date
                }),
            });

            if (res.ok) {
                setSuccess("Job created successfully!");
                setShowForm(false);
                setFormData({ title: "", marketId: "", storeId: "", startTime: "", endTime: "", bonus: "0", isRecurring: true, date: "" });
                fetchData();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to create job");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "OPEN": return "var(--secondary)";
            case "ASSIGNED": return "var(--primary)";
            case "ACCEPTED": return "var(--success)";
            case "IN_PROGRESS": return "#3b82f6";
            case "RECAP_PENDING": return "#f59e0b";
            case "COMPLETED": return "#10b981";
            default: return "#6b7280";
        }
    };

    // Convert "HH:MM" to 12-hour format e.g. "2:00 PM"
    const to12hr = (time: string) => {
        const [h, m] = time.split(":").map(Number);
        const period = h >= 12 ? "PM" : "AM";
        const hour = h % 12 || 12;
        return `${hour}:${String(m).padStart(2, "0")} ${period}`;
    };

    // Calculate shift duration from two "HH:MM" strings
    const calcDuration = (start: string, end: string) => {
        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);
        let mins = (eh * 60 + em) - (sh * 60 + sm);
        if (mins < 0) mins += 24 * 60; // handle overnight
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    const handleOpenEdit = (job: Job) => {
        setEditingJob(job);
        setEditTimes({ startTime: job.startTimeStr, endTime: job.endTimeStr });
        setEditInProgressWorkers(
            job.assignments
                .filter(a => a.status === "IN_PROGRESS")
                .map(a => a.worker?.name)
                .filter(Boolean) as string[]
        );
        setError("");
    };

    const handleSaveEdit = async () => {
        if (!editingJob) return;
        setEditSaving(true);
        try {
            const res = await fetch(`/api/jobs/${editingJob.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ startTimeStr: editTimes.startTime, endTimeStr: editTimes.endTime }),
            });
            if (res.ok) {
                setEditingJob(null);
                setSuccess("Shift times updated.");
                fetchData();
            } else {
                const d = await res.json();
                setError(d.error || "Failed to update shift times");
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setEditSaving(false);
        }
    };

    const handleDeleteJob = async (id: string, name: string) => {
        if (!confirm(`Delete job "${name}"? This cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
            if (res.ok) {
                setSuccess("Job deleted.");
                fetchData();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to delete job");
            }
        } catch {
            setError("An unexpected error occurred");
        }
    };

    const filteredJobs = useMemo(() => {
        if (selectedMarket === "all") return jobs;
        return jobs.filter(job => job.marketId === selectedMarket);
    }, [jobs, selectedMarket]);

    // Store picker options, narrowed to the currently selected market -- same
    // cascading UX the create-job form's own store picker already uses.
    const storesForByDate = useMemo(() => {
        if (selectedMarket === "all") return stores;
        return stores.filter(s => s.marketId === selectedMarket);
    }, [stores, selectedMarket]);

    // Effective market for the bulk worker picker: prefer the selected store's own
    // market (Store.marketId is a required schema field, so a *found* store always has
    // one) over the market filter, so picking "Store A" narrows the worker list even
    // when "All Markets" is still selected. Falls back to the market filter if the
    // selected store id isn't in the current `stores` list (stale selection after a
    // refetch) rather than silently showing every worker system-wide.
    const effectiveByDateMarketId = useMemo(() => {
        if (selectedStore !== "all") {
            const store = stores.find(s => s.id === selectedStore);
            if (store) return store.marketId;
        }
        return selectedMarket !== "all" ? selectedMarket : null;
    }, [selectedStore, selectedMarket, stores]);

    // Worker picker options for the bulk request bar, narrowed by the effective market.
    const workersForByDate = useMemo(() => {
        if (!effectiveByDateMarketId) return workers;
        return workers.filter(w => w.marketId === effectiveByDateMarketId);
    }, [workers, effectiveByDateMarketId]);

    const filteredShiftsByDate = useMemo(() => {
        return shiftsByDate
            .filter(s => selectedMarket === "all" || s.marketId === selectedMarket)
            .filter(s => selectedStore === "all" || s.storeId === selectedStore)
            .sort((a, b) => {
                // Dated rows chronologically ascending; recurring templates (no
                // materialized date yet) grouped last.
                if (!a.date && !b.date) return 0;
                if (!a.date) return 1;
                if (!b.date) return -1;
                return a.date.localeCompare(b.date);
            });
    }, [shiftsByDate, selectedMarket, selectedStore]);

    // Status marker for a By Date row: Unassigned (no assignment yet) / Requested
    // (AVAILABLE + targeted invite pending) / Released (AVAILABLE, open to whole
    // market — the pre-existing organic-release case) / Assigned (otherwise).
    const getShiftMarker = (shift: ShiftByDate): { label: string; bg: string; color: string } => {
        if (!shift.assignmentId) return { label: "Unassigned", bg: "#fee2e2", color: "#991b1b" };
        if (shift.status === "AVAILABLE" && shift.requestedWorkerId) {
            return { label: `Requested — ${shift.assignedWorker}`, bg: "#fef3c7", color: "#92400e" };
        }
        if (shift.status === "AVAILABLE") {
            return { label: `Released — ${shift.assignedWorker}`, bg: "#fef3c7", color: "#92400e" };
        }
        return { label: `Assigned — ${shift.assignedWorker}`, bg: "#d1fae5", color: "#065f46" };
    };

    const toggleRow = (shift: ShiftByDate) => {
        if (!shift.date) return; // recurring templates aren't selectable
        setSelectedRows(prev => {
            const next = new Map(prev);
            const key = rowKey(shift);
            if (next.has(key)) next.delete(key);
            else next.set(key, shift);
            return next;
        });
    };

    const selectableRows = useMemo(() => filteredShiftsByDate.filter(s => !!s.date), [filteredShiftsByDate]);
    const allSelected = selectableRows.length > 0 && selectableRows.every(s => selectedRows.has(rowKey(s)));

    const toggleSelectAll = () => {
        setSelectedRows(prev => {
            if (allSelected) return new Map();
            const next = new Map(prev);
            selectableRows.forEach(s => next.set(rowKey(s), s));
            return next;
        });
    };

    const summarizeResults = (results: Array<{ success: boolean; reason?: string }>) => {
        const succeeded = results.filter(r => r.success).length;
        const skipped = results.length - succeeded;
        if (skipped === 0) return `${succeeded} requested.`;
        const reasons = Array.from(new Set(results.filter(r => !r.success).map(r => r.reason).filter(Boolean)));
        return `${succeeded} requested, ${skipped} skipped${reasons.length ? ` (${reasons.join("; ")})` : ""}.`;
    };

    const handleBulkRequest = async () => {
        if (!bulkWorkerId || selectedRows.size === 0) return;
        setBulkBusy(true);
        try {
            const items = Array.from(selectedRows.values()).map(s => ({ jobId: s.jobId, date: s.date, assignmentId: s.assignmentId }));
            const res = await fetch("/api/admin/jobs/by-date/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items, workerId: bulkWorkerId })
            });
            const d = await res.json();
            if (res.ok) {
                alert(summarizeResults(d.results || []));
                setSelectedRows(new Map());
                fetchByDate();
            } else {
                alert(d.error || "Failed to send requests");
            }
        } catch {
            alert("Network error");
        } finally {
            setBulkBusy(false);
        }
    };

    const handleRowRequest = async (shift: ShiftByDate) => {
        const key = rowKey(shift);
        const workerId = perRowWorkerId[key];
        if (!workerId) return alert("Select a worker first");
        setRowBusy(prev => ({ ...prev, [key]: "request" }));
        try {
            const res = await fetch("/api/admin/jobs/by-date/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: [{ jobId: shift.jobId, date: shift.date, assignmentId: shift.assignmentId }], workerId })
            });
            const d = await res.json();
            if (res.ok) {
                alert(summarizeResults(d.results || []));
                fetchByDate();
            } else {
                alert(d.error || "Failed to send request");
            }
        } catch {
            alert("Network error");
        } finally {
            setRowBusy(prev => ({ ...prev, [key]: undefined }));
        }
    };

    const handleRowAssign = async (shift: ShiftByDate) => {
        const key = rowKey(shift);
        const workerId = perRowWorkerId[key];
        if (!workerId) return alert("Select a worker first");
        setRowBusy(prev => ({ ...prev, [key]: "assign" }));
        try {
            const res = shift.assignmentId && shift.status === "AVAILABLE"
                ? await fetch(`/api/users/${workerId}/assignments`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ assignmentId: shift.assignmentId, directAssign: true, newWorkerId: workerId })
                })
                : await fetch(`/api/users/${workerId}/assignments`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ jobId: shift.jobId, date: shift.date })
                });
            if (res.ok) {
                alert("Shift assigned successfully");
                fetchByDate();
            } else {
                const d = await res.json();
                alert(d.error || "Failed to assign");
            }
        } catch {
            alert("Network error");
        } finally {
            setRowBusy(prev => ({ ...prev, [key]: undefined }));
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.actions} style={{ alignItems: "center" }}>
                    <select 
                        value={selectedMarket} 
                        onChange={(e) => setSelectedMarket(e.target.value)} 
                        className="input" 
                        style={{ width: "auto", minWidth: "160px", padding: "0.5rem 0.75rem", fontSize: "0.875rem", height: "38px" }}
                    >
                        <option value="all">All Markets</option>
                        {markets.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                    <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                        {showForm ? "Cancel" : "Create New Job"}
                    </button>
                </div>
                <h1 className="heading h2">Job Scheduling</h1>
                <p className="text-secondary">Manage and assign shifts across all locations.</p>
            </header>

            {/* TABS */}
            <div style={{ display: "flex", gap: "2rem", borderBottom: "1px solid #e5e7eb", marginTop: "1rem", marginBottom: "1.5rem" }}>
                {[
                    { key: "all" as const, label: "All Jobs" },
                    { key: "byDate" as const, label: "By Date" },
                ].map(tab => (
                    <div
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: "0.75rem 0",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontWeight: activeTab === tab.key ? 700 : 500,
                            color: activeTab === tab.key ? "#6366f1" : "#6b7280",
                            borderBottom: activeTab === tab.key ? "2px solid #6366f1" : "2px solid transparent",
                            marginBottom: "-1px",
                        }}
                    >
                        {tab.label}
                    </div>
                ))}
            </div>

            {activeTab === "byDate" && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <select
                                value={bulkWorkerId}
                                onChange={(e) => setBulkWorkerId(e.target.value)}
                                className="input"
                                style={{ width: "auto", minWidth: "180px", padding: "0.5rem 0.75rem", fontSize: "0.875rem", height: "38px" }}
                            >
                                <option value="">Select worker...</option>
                                {workersForByDate.map(w => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleBulkRequest}
                                disabled={!bulkWorkerId || selectedRows.size === 0 || bulkBusy}
                                className="btn"
                                style={{
                                    padding: "0.5rem 1rem", background: "white", color: "#4f46e5",
                                    border: "1.5px solid #4f46e5", borderRadius: "8px", fontWeight: 600,
                                    fontSize: "0.875rem", height: "38px",
                                    opacity: !bulkWorkerId || selectedRows.size === 0 || bulkBusy ? 0.6 : 1
                                }}
                            >
                                {bulkBusy ? "Requesting..." : `Request${selectedRows.size > 0 ? ` (${selectedRows.size})` : ""}`}
                            </button>
                        </div>
                        <select
                            value={selectedStore}
                            onChange={(e) => setSelectedStore(e.target.value)}
                            className="input"
                            style={{ width: "auto", minWidth: "160px", padding: "0.5rem 0.75rem", fontSize: "0.875rem", height: "38px" }}
                        >
                            <option value="all">All Stores</option>
                            {storesForByDate.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleSelectAll}
                                            aria-label="Select all shifts"
                                        />
                                    </th>
                                    <th>Store</th>
                                    <th>Market</th>
                                    <th>Date</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Assignment Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingByDate ? (
                                    <tr><td colSpan={8} className="text-center" style={{ padding: "3rem" }}>Loading shifts...</td></tr>
                                ) : filteredShiftsByDate.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center" style={{ padding: "3rem" }}>No shifts found.</td></tr>
                                ) : (
                                    filteredShiftsByDate.map(shift => {
                                        const marker = getShiftMarker(shift);
                                        const key = rowKey(shift);
                                        const rowWorkers = workers.filter(w => w.marketId === shift.marketId);
                                        const busy = rowBusy[key];
                                        return (
                                            <tr key={key} className="animate-fade-in">
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.has(key)}
                                                        onChange={() => toggleRow(shift)}
                                                        disabled={!shift.date}
                                                        title={!shift.date ? "Select a specific date to request/assign this shift" : undefined}
                                                    />
                                                </td>
                                                <td><strong>{shift.storeName}</strong></td>
                                                <td>{shift.marketName}</td>
                                                <td>{shift.date ? new Date(shift.date).toLocaleDateString(undefined, { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" }) : "Recurring"}</td>
                                                <td>{to12hr(shift.startTime)}</td>
                                                <td>{to12hr(shift.endTime)}</td>
                                                <td>
                                                    <span style={{
                                                        padding: "0.25rem 0.75rem",
                                                        borderRadius: "99px",
                                                        fontSize: "0.7rem",
                                                        fontWeight: 700,
                                                        background: marker.bg,
                                                        color: marker.color,
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.03em",
                                                    }}>
                                                        {marker.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                                                        <select
                                                            value={perRowWorkerId[key] || ""}
                                                            onChange={e => setPerRowWorkerId(prev => ({ ...prev, [key]: e.target.value }))}
                                                            disabled={!shift.date}
                                                            style={{ padding: "0.4rem", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "0.8rem" }}
                                                        >
                                                            <option value="">Select worker...</option>
                                                            {rowWorkers.map(w => (
                                                                <option key={w.id} value={w.id}>{w.name}</option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={() => handleRowAssign(shift)}
                                                            disabled={!shift.date || !perRowWorkerId[key] || !!busy}
                                                            style={{
                                                                padding: "0.4rem 0.75rem", background: "#6366f1", color: "white",
                                                                border: "none", borderRadius: "8px", fontWeight: 600,
                                                                cursor: "pointer", fontSize: "0.8rem",
                                                                opacity: !shift.date || !perRowWorkerId[key] || !!busy ? 0.6 : 1
                                                            }}
                                                        >
                                                            {busy === "assign" ? "Assigning..." : "Assign"}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRowRequest(shift)}
                                                            disabled={!shift.date || !perRowWorkerId[key] || !!busy}
                                                            style={{
                                                                padding: "0.4rem 0.75rem", background: "white", color: "#4f46e5",
                                                                border: "1.5px solid #4f46e5", borderRadius: "8px", fontWeight: 600,
                                                                cursor: "pointer", fontSize: "0.8rem",
                                                                opacity: !shift.date || !perRowWorkerId[key] || !!busy ? 0.6 : 1
                                                            }}
                                                        >
                                                            {busy === "request" ? "Sending..." : "Request"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "all" && (
            <>
            {showForm && (
                <div className="card glass animate-fade-in" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
                    <h3 className="heading h4">Setup New Shift</h3>
                    <form onSubmit={handleCreateJob} className={styles.formGrid}>

                        {/* 1. Job Name */}
                        <div className={styles.inputGroup} style={{ gridColumn: "span 2" }}>
                            <label>Job Name</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g. Saturday Morning Demo"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        {/* 2. Market */}
                        <div className={styles.inputGroup}>
                            <label>Market</label>
                            <select
                                className="input"
                                value={formData.marketId}
                                onChange={e => setFormData({ ...formData, marketId: e.target.value })}
                                required
                            >
                                <option value="">Select a Market</option>
                                {markets.map(market => (
                                    <option key={market.id} value={market.id}>{market.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* 3. Store (filtered by market) */}
                        <div className={styles.inputGroup}>
                            <label>Store Location</label>
                            <select
                                className="input"
                                value={formData.storeId}
                                onChange={e => setFormData({ ...formData, storeId: e.target.value })}
                                required
                                disabled={!formData.marketId}
                            >
                                <option value="">
                                    {formData.marketId ? "Select a Store" : "Select a Market first"}
                                </option>
                                {filteredStores.map(store => (
                                    <option key={store.id} value={store.id}>{store.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* 4. Start Time */}
                        <div className={styles.inputGroup}>
                            <label>Start Time</label>
                            <input
                                type="time"
                                className="input"
                                value={formData.startTime}
                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                required
                            />
                        </div>

                        {/* 5. End Time */}
                        <div className={styles.inputGroup}>
                            <label>End Time</label>
                            <input
                                type="time"
                                className="input"
                                value={formData.endTime}
                                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                required
                            />
                        </div>

                        {/* 6. Bonus (Optional) */}
                        <div className={styles.inputGroup}>
                            <label>Bonus (Optional)</label>
                            <input
                                type="number"
                                className="input"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                value={formData.bonus}
                                onChange={e => setFormData({ ...formData, bonus: e.target.value })}
                            />
                        </div>

                        {/* 7. Shift Type (Recurring vs Specific Date) */}
                        <div className={styles.inputGroup} style={{ gridColumn: "span 2" }}>
                            <label>Shift Type</label>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500, color: '#374151' }}>
                                    <input
                                        type="radio"
                                        name="shiftType"
                                        checked={formData.isRecurring}
                                        onChange={() => setFormData({ ...formData, isRecurring: true })}
                                        style={{ width: '1.25rem', height: '1.25rem', accentColor: '#6366f1' }}
                                    />
                                    Recurring (Template)
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500, color: '#374151' }}>
                                    <input
                                        type="radio"
                                        name="shiftType"
                                        checked={!formData.isRecurring}
                                        onChange={() => setFormData({ ...formData, isRecurring: false })}
                                        style={{ width: '1.25rem', height: '1.25rem', accentColor: '#6366f1' }}
                                    />
                                    Specific Date
                                </label>
                            </div>
                        </div>

                        {/* 8. Specific Date Input (if applicable) */}
                        {!formData.isRecurring && (
                            <div className={styles.inputGroup} style={{ gridColumn: "span 2", animation: "fadeIn 0.2s ease-out" }}>
                                <label>Date</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    required={!formData.isRecurring}
                                />
                            </div>
                        )}

                        <div className={styles.formActions} style={{ gridColumn: "span 2" }}>
                            <button type="submit" className="btn btn-primary">Publish Job</button>
                        </div>
                    </form>
                </div>
            )}

            {error && <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>{error}</div>}
            {success && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>{success}</div>}

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Market</th>
                            <th>Store</th>
                            <th>Date / Type</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Shift Duration</th>
                            <th>Bonus</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={10} className="text-center" style={{ padding: "3rem" }}>Loading jobs...</td></tr>
                        ) : filteredJobs.length === 0 ? (
                            <tr><td colSpan={10} className="text-center" style={{ padding: "3rem" }}>No jobs found.</td></tr>
                        ) : (
                            filteredJobs.map(job => (
                                <tr key={job.id} className="animate-fade-in">
                                    <td><strong>{job.title}</strong></td>
                                    <td>{job.market?.name}</td>
                                    <td>{job.store?.name}</td>
                                    <td>
                                        {job.date ? new Date(job.date).toLocaleDateString(undefined, { timeZone: 'UTC' }) : <span style={{ padding: "0.25rem 0.75rem", background: "#eef2ff", color: "#4f46e5", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.025em" }}>Recurring</span>}
                                    </td>
                                    <td>{to12hr(job.startTimeStr)}</td>
                                    <td>{to12hr(job.endTimeStr)}</td>
                                    <td>{calcDuration(job.startTimeStr, job.endTimeStr)}</td>
                                    <td>{job.bonus > 0 ? `$${job.bonus.toFixed(2)}` : "–"}</td>
                                    <td>
                                        <button
                                            onClick={() => handleOpenEdit(job)}
                                            className="btn"
                                            style={{ background: "#6366f1", color: "white", padding: "0.25rem 0.75rem", fontSize: "0.8rem" }}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDeleteJob(job.id, job.title)}
                                            className="btn"
                                            style={{ background: "#ef4444", color: "white", padding: "0.25rem 0.75rem", fontSize: "0.8rem" }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            </>
            )}

            {editingJob && (
                <div
                    onClick={() => setEditingJob(null)}
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="card glass"
                        style={{ width: "100%", maxWidth: "420px", padding: "1.75rem", borderRadius: "1rem" }}
                    >
                        <h3 className="heading h4" style={{ marginBottom: "0.25rem" }}>Edit Shift Times</h3>
                        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1.5rem" }}>{editingJob.title}</p>

                        {editInProgressWorkers.length > 0 && (
                            <div style={{ background: "#fffbeb", border: "1px solid #f59e0b", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.875rem", color: "#92400e" }}>
                                <strong>⚠️ {editInProgressWorkers.join(", ")} {editInProgressWorkers.length === 1 ? "is" : "are"} currently clocked in.</strong>
                                <br />Changing the end time will affect their auto-clockout.
                            </div>
                        )}

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

                        {editTimes.startTime && editTimes.endTime && (
                            <p style={{ fontSize: "0.8125rem", color: "#6b7280", marginBottom: "1.25rem" }}>
                                Duration: <strong>{calcDuration(editTimes.startTime, editTimes.endTime)}</strong>
                                {" "}({to12hr(editTimes.startTime)} – {to12hr(editTimes.endTime)})
                            </p>
                        )}

                        {error && <div className="alert alert-danger" style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>{error}</div>}

                        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                            <button onClick={() => setEditingJob(null)} className="btn" style={{ background: "#f3f4f6", color: "#374151" }}>Cancel</button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={editSaving || !editTimes.startTime || !editTimes.endTime}
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
