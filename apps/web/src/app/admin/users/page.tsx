"use client";

import { useState, useEffect } from "react";
import styles from "./users.module.css";
import { generateUserReportPDF } from "@/lib/pdf-service";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    _count: { jobs: number };
    assignedHours: number;
    workedHours: number;
    totalReimbursement: number;
    hourlyWage?: number;
    market?: { name: string };
    managedMarket?: { name: string };
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    // Invite Form State
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("WORKER");
    const [inviteMarketId, setInviteMarketId] = useState("");
    const [inviteStoreId, setInviteStoreId] = useState("");
    const [inviteHourlyWage, setInviteHourlyWage] = useState("20.00");
    const [inviting, setInviting] = useState(false);
    const [inviteLink, setInviteLink] = useState("");
    const [markets, setMarkets] = useState<any[]>([]);

    // Quick Job Modal State
    const [showJobModal, setShowJobModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [stores, setStores] = useState<any[]>([]);

    // Weekly Schedule State
    const [weekSchedule, setWeekSchedule] = useState<any>(
        ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => ({
            day,
            enabled: false,
            startTime: "09:00",
            endTime: "17:00",
            storeId: ""
        }))
    );

    useEffect(() => {
        fetchCurrentUser();
        fetchUsers();
        fetchStores();
        fetchMarkets();
    }, []);

    const fetchCurrentUser = async () => {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
            const data = await res.json();
            const user = data.user;
            setCurrentUser(user);
            // /api/auth/me now returns managedMarketId directly from DB
            if (user.role === "MARKET_MANAGER" && user.managedMarketId) {
                setInviteMarketId(user.managedMarketId);
            }
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            if (res.ok) {
                setUsers(data);
            } else {
                setError(data.error || "Failed to fetch users");
                if (data.details) console.error("User fetch details:", data.details);
            }
        } catch (err) {
            setError("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const fetchStores = async () => {
        try {
            const res = await fetch("/api/stores");
            if (res.ok) {
                setStores(await res.json());
            }
        } catch (err) { }
    };

    const fetchMarkets = async () => {
        try {
            const res = await fetch("/api/markets");
            if (res.ok) {
                setMarkets(await res.json());
            }
        } catch (err) { }
    };

    const calculateDate = (dayName: string) => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const targetDay = days.indexOf(dayName);
        const today = new Date();
        const currentDay = today.getDay();
        let diff = targetDay - currentDay;
        if (diff < 0) diff += 7;
        const resultDate = new Date();
        resultDate.setDate(today.getDate() + diff);
        return resultDate.toISOString().split("T")[0];
    };

    const handleQuickJobSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        const activeDays = weekSchedule.filter((d: any) => d.enabled && d.storeId);
        if (activeDays.length === 0) {
            setError("Please enable at least one day and select a store");
            return;
        }

        try {
            let successCount = 0;
            for (const dayData of activeDays) {
                const date = calculateDate(dayData.day);
                const startDateTime = new Date(`${date}T${dayData.startTime}`);
                const endDateTime = new Date(`${date}T${dayData.endTime}`);

                const res = await fetch("/api/jobs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        storeId: dayData.storeId,
                        workerId: selectedUser.id,
                        date,
                        startTime: startDateTime.toISOString(),
                        endTime: endDateTime.toISOString(),
                        status: "ASSIGNED"
                    }),
                });
                if (res.ok) successCount++;
            }

            if (successCount > 0) {
                setSuccess(`Successfully scheduled ${successCount} jobs for ${selectedUser.name}`);
                setShowJobModal(false);
                fetchUsers();
            }
        } catch (err) {
            setError("An error occurred during bulk scheduling");
        }
    };

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviting(true);
        setError("");
        setInviteLink("");
        try {
            const res = await fetch("/api/invites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: inviteEmail,
                    role: inviteRole,
                    marketId: (inviteRole === "MARKET_MANAGER" || inviteRole === "WORKER")
                        ? inviteMarketId
                        : null,
                    hourlyWage: inviteHourlyWage ? parseFloat(inviteHourlyWage) : null
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(`Invite generated for ${inviteEmail} - opening your email client...`);
                setInviteLink(data.inviteLink);
                
                // Trigger mail client
                const subject = encodeURIComponent("You've been invited to Workforce OS!");
                const body = encodeURIComponent(
                    `Hello,\n\nYou have been invited to join the Workforce OS team.\n\nClick the link below to accept your invitation and set up your account:\n${data.inviteLink}\n\nWelcome to the team!`
                );
                window.location.href = `mailto:${inviteEmail}?subject=${subject}&body=${body}`;

                setInviteEmail("");
                setInviteMarketId("");
                setInviteStoreId("");
            } else {
                setError(data.error || "Failed to send invite");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setInviting(false);
        }
    };

    const updateUserStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                setSuccess("User status updated");
                fetchUsers();
            }
        } catch (err) {
            setError("Failed to update status");
        }
    };

    const startEditing = (user: User) => {
        setEditingUserId(user.id);
        setEditForm({
            role: user.role,
            hourlyWage: user.hourlyWage?.toString() || "",
            manualWorkedHours: user.workedHours?.toString() || "",
            marketId: (user.market as any)?.id || (user.managedMarket as any)?.id || (user as any).marketId || (user as any).managedMarketId || ""
        });
    };

    const handleCancelEdit = () => {
        setEditingUserId(null);
        setEditForm({});
    };

    const handleSaveEdit = async (userId: string) => {
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role: editForm.role,
                    hourlyWage: editForm.hourlyWage ? parseFloat(editForm.hourlyWage) : null,
                    manualWorkedHours: editForm.manualWorkedHours ? parseFloat(editForm.manualWorkedHours) : null,
                    marketId: (editForm.role === "MARKET_MANAGER" || editForm.role === "WORKER") ? editForm.marketId : null,
                    managedMarketId: editForm.role === "MARKET_MANAGER" ? editForm.marketId : null,
                }),
            });

            if (res.ok) {
                setSuccess("User updated successfully");
                setEditingUserId(null);
                fetchUsers();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to update user");
            }
        } catch (err) {
            setError("An error occurred while saving");
        }
    };

    const handleDeleteUser = async (userId: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setSuccess(`User "${name}" deleted`);
                setEditingUserId(null);
                fetchUsers();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to delete user");
            }
        } catch (err) {
            setError("An error occurred while deleting");
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className="heading h2">User Management</h1>
                <p className="text-secondary">Onboard team members and manage active accounts.</p>
            </header>

            <div className="flex-column gap-4" style={{ display: "flex", flexDirection: "column" }}>
                {/* Top: Invite Section */}
                <section className="card glass animate-fade-in">
                    <h3 className="heading h4">Invite Team Member</h3>
                    <p className="text-secondary" style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                        Send an onboarding link to a new Worker or Manager.
                    </p>
                    <form onSubmit={handleSendInvite}>
                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="email@example.com"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Role</label>
                                <select
                                    className="input"
                                    value={inviteRole}
                                    onChange={e => setInviteRole(e.target.value)}
                                >
                                    <option value="WORKER">Worker</option>
                                    {currentUser?.role === "ADMIN" && (
                                        <>
                                            <option value="MARKET_MANAGER">Market Manager</option>
                                            <option value="ADMIN">Admin</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {(inviteRole === "WORKER" || inviteRole === "MARKET_MANAGER") && (
                                <div className={styles.inputGroup}>
                                    <label>{inviteRole === "WORKER" ? "Assigned Market" : "Managed Market"}</label>
                                    <select
                                        className="input"
                                        value={inviteMarketId}
                                        onChange={e => setInviteMarketId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Market...</option>
                                        {markets.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className={styles.inputGroup} style={{ width: inviteRole === "WORKER" ? "120px" : "160px" }}>
                                <label>{inviteRole === "WORKER" ? "Pay/Hr" : "Monthly Salary"}</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="input"
                                    placeholder={inviteRole === "WORKER" ? "20.00" : "5000.00"}
                                    value={inviteHourlyWage}
                                    onChange={e => setInviteHourlyWage(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" disabled={inviting} className="btn btn-primary" style={{ height: "42px" }}>
                                {inviting ? "Sending..." : "Create & Send Invite"}
                            </button>
                        </div>
                    </form>

                    {inviteLink && (
                        <div className="card" style={{ marginTop: "1.5rem", background: "rgba(var(--primary-rgb), 0.1)", border: "1px solid var(--primary-light)" }}>
                            <p style={{ fontSize: "0.75rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Registration Link:</p>
                            <code style={{ fontSize: "0.75rem", wordBreak: "break-all", display: "block" }}>{inviteLink}</code>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ marginTop: "0.5rem", width: "100%" }}
                                onClick={() => {
                                    navigator.clipboard.writeText(inviteLink);
                                    setSuccess("Link copied to clipboard!");
                                }}
                            >
                                Copy Link
                            </button>
                        </div>
                    )}
                </section>

                {/* Bottom: User List */}
                <section className={styles.tableWrapper} style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Location/Scope</th>
                                <th style={{ textAlign: 'right' }}>Pay Rate</th>
                                <th style={{ textAlign: 'right' }}>Worked</th>
                                <th style={{ textAlign: 'right' }}>Assigned</th>
                                <th style={{ textAlign: 'right' }}>Reimb.</th>
                                <th style={{ textAlign: 'right' }}>Pay for Cycle</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="text-center" style={{ padding: "3rem" }}>Loading team...</td></tr>
                            ) : users.map(user => {
                                const isEditing = editingUserId === user.id;

                                return (
                                    <tr key={user.id} className="animate-fade-in">
                                        <td>
                                            <div className={styles.userInfo} style={{ position: "relative" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                    <strong>{user.name}</strong>
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditing(user)}
                                                        className="btn btn-ghost btn-sm"
                                                        style={{ padding: "2px", height: "auto" }}
                                                        title="Edit User"
                                                    >
                                                        ✎
                                                    </button>
                                                </div>
                                                <span>{user.email}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <select
                                                    className="input input-sm"
                                                    value={editForm.role}
                                                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                                >
                                                    <option value="WORKER">Worker</option>
                                                    <option value="MARKET_MANAGER">Market Manager</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            ) : (
                                                <span className="badge">{user.role}</span>
                                            )}
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <div className="flex-column gap-1">
                                                    {(editForm.role === "WORKER" || editForm.role === "MARKET_MANAGER") && (
                                                        <select
                                                            className="input input-sm"
                                                            value={editForm.marketId}
                                                            onChange={e => setEditForm({ ...editForm, marketId: e.target.value })}
                                                        >
                                                            <option value="">Select Market...</option>
                                                            {markets.map(m => (
                                                                <option key={m.id} value={m.id}>{m.name}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                    {editForm.role === "ADMIN" && <span className="text-secondary" style={{ fontSize: "0.75rem" }}>System Wide</span>}
                                                </div>
                                            ) : (
                                                <div className="text-secondary" style={{ fontSize: "0.875rem" }}>
                                                    {user.role === "ADMIN" && "System Wide"}
                                                    {(user.role === "MARKET_MANAGER" || user.role === "WORKER") && (
                                                        <span>Market: <strong>{user.managedMarket?.name || user.market?.name || 'Unassigned'}</strong></span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="input input-sm"
                                                    style={{ width: "80px", textAlign: "right" }}
                                                    value={editForm.hourlyWage}
                                                    onChange={e => setEditForm({ ...editForm, hourlyWage: e.target.value })}
                                                />
                                            ) : (
                                                user.hourlyWage ? `$${user.hourlyWage.toFixed(2)}${user.role === "WORKER" ? "/hr" : "/mo"}` : '-'
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    className="input input-sm"
                                                    style={{ width: "60px", textAlign: "right" }}
                                                    value={editForm.manualWorkedHours}
                                                    onChange={e => setEditForm({ ...editForm, manualWorkedHours: e.target.value })}
                                                />
                                            ) : (
                                                user.role === "WORKER" ? `${user.workedHours}h` : 'N/A'
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                            {user.role === "WORKER" ? `${user.assignedHours}h` : 'N/A'}
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                            ${(user.totalReimbursement || 0).toFixed(2)}
                                        </td>
<td style={{ textAlign: 'right', color: "var(--success)", fontWeight: 700 }}>
    {user.role === "WORKER"
        ? `$${((user.workedHours * (user.hourlyWage || 0)) + (user.totalReimbursement || 0)).toFixed(2)}`
        : 'N/A'}
</td>
                                        <td>
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSaveEdit(user.id)}
                                                            className="btn btn-primary btn-sm"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteUser(user.id, user.name)}
                                                            className="btn btn-danger btn-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleCancelEdit}
                                                            className="btn btn-secondary btn-sm"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    user.role === "WORKER" && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => window.open(`/admin/users/${user.id}/assign`, '_blank')}
                                                                className="btn btn-primary btn-sm"
                                                            >
                                                                Add Job
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => generateUserReportPDF(user)}
                                                                className="btn btn-secondary btn-sm"
                                                            >
                                                                Report
                                                            </button>
                                                        </>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </section>
            </div>

            {/* Quick Job Modal */}
            {
                showJobModal && selectedUser && (
                    <div className={styles.modalOverlay}>
                        <div className={`${styles.modal} card glass animate-scale-in`} style={{ maxWidth: "800px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                <h3 className="heading h4">Weekly Schedule for {selectedUser.name}</h3>
                                <button type="button" onClick={() => setShowJobModal(false)} className="btn btn-secondary btn-sm">Close</button>
                            </div>

                            <form onSubmit={handleQuickJobSubmit} className="flex-column gap-3" style={{ display: "flex" }}>
                                <div className={styles.scheduleGridHeader}>
                                    <span>Day</span>
                                    <span>Hours</span>
                                    <span>Location (Store)</span>
                                </div>

                                <div className={styles.scheduleRows}>
                                    {weekSchedule.map((dayData: any, index: number) => (
                                        <div key={dayData.day} className={`${styles.scheduleRow} ${dayData.enabled ? styles.rowActive : ""}`}>
                                            <div className={styles.dayLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={dayData.enabled}
                                                    onChange={(e) => {
                                                        const newSchedule = [...weekSchedule];
                                                        newSchedule[index].enabled = e.target.checked;
                                                        setWeekSchedule(newSchedule);
                                                    }}
                                                />
                                                <strong>{dayData.day}</strong>
                                            </div>

                                            <div className={styles.timeInputs}>
                                                <input
                                                    type="time"
                                                    className="input input-sm"
                                                    value={dayData.startTime}
                                                    disabled={!dayData.enabled}
                                                    onChange={(e) => {
                                                        const newSchedule = [...weekSchedule];
                                                        newSchedule[index].startTime = e.target.value;
                                                        setWeekSchedule(newSchedule);
                                                    }}
                                                />
                                                <span>to</span>
                                                <input
                                                    type="time"
                                                    className="input input-sm"
                                                    value={dayData.endTime}
                                                    disabled={!dayData.enabled}
                                                    onChange={(e) => {
                                                        const newSchedule = [...weekSchedule];
                                                        newSchedule[index].endTime = e.target.value;
                                                        setWeekSchedule(newSchedule);
                                                    }}
                                                />
                                            </div>

                                            <div className={styles.storeSelect}>
                                                <select
                                                    className="input input-sm"
                                                    value={dayData.storeId}
                                                    disabled={!dayData.enabled}
                                                    onChange={(e) => {
                                                        const newSchedule = [...weekSchedule];
                                                        newSchedule[index].storeId = e.target.value;
                                                        setWeekSchedule(newSchedule);
                                                    }}
                                                    required={dayData.enabled}
                                                >
                                                    <option value="">Select Store...</option>
                                                    {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--card-border)" }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                        Publish Weekly Schedule
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {error && <div className="alert alert-danger fixed-toast animate-fade-in">{error}</div>}
            {success && <div className="alert alert-success fixed-toast animate-fade-in">{success}</div>}
        </div >
    );
}
