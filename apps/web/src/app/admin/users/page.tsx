"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./users.module.css";
import { generateUserReportPDF } from "@/lib/pdf-service";
import Papa from "papaparse";

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
    totalBonus: number;
    hourlyWage?: number;
    marketId?: string | null;
    managedMarketId?: string | null;
    market?: { name: string };
    managedMarket?: { name: string };
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedMarket, setSelectedMarket] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    const filteredUsers = useMemo(() => {
        if (selectedMarket === "all") return users;
        return users.filter(u => u.marketId === selectedMarket || u.managedMarketId === selectedMarket);
    }, [users, selectedMarket]);

    // Invite Form State
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("WORKER");
    const [inviteMarketId, setInviteMarketId] = useState("");
    const [inviteStoreId, setInviteStoreId] = useState("");
    const [inviteHourlyWage, setInviteHourlyWage] = useState("20.00");
    const [inviting, setInviting] = useState(false);
    const [inviteLink, setInviteLink] = useState("");
    const [markets, setMarkets] = useState<any[]>([]);

    // Bulk Invite State
    const [bulkEmailsText, setBulkEmailsText] = useState("");
    const [bulkRole, setBulkRole] = useState("WORKER");
    const [bulkMarketId, setBulkMarketId] = useState("");
    const [bulkHourlyWage, setBulkHourlyWage] = useState("20.00");
    const [bulkFile, setBulkFile] = useState<File | null>(null);
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const [bulkProgress, setBulkProgress] = useState("");
    const [bulkResults, setBulkResults] = useState<any[] | null>(null);
    const [bulkTab, setBulkTab] = useState<"paste" | "upload">("paste");

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
                setBulkMarketId(user.managedMarketId);
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
                const subject = encodeURIComponent("You've been invited to Kruto Tastes!");
                const body = encodeURIComponent(
                    `Hello,\n\nYou have been invited to join the Kruto Tastes team.\n\nClick the link below to accept your invitation and set up your account:\n${data.inviteLink}\n\nWelcome to the team!`
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

    const handleBulkInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setBulkProcessing(true);
        setBulkProgress("Initializing...");
        setBulkResults(null);
        setError("");
        setSuccess("");

        try {
            let emails: string[] = [];
            let originalCsvRows: any[] = [];
            let emailColumnName = "";

            if (bulkTab === "paste") {
                // Split by comma, semi-colon, or newlines
                emails = bulkEmailsText
                    .split(/[\n,;]+/)
                    .map(email => email.trim())
                    .filter(email => email && email.includes("@"));
                if (emails.length === 0) {
                    throw new Error("No valid email addresses found in the text field.");
                }
            } else {
                if (!bulkFile) {
                    throw new Error("Please select a CSV file first.");
                }

                // Parse CSV file client-side
                const fileText = await bulkFile.text();
                const parseResult = Papa.parse(fileText, {
                    header: true,
                    skipEmptyLines: true,
                });

                if (parseResult.errors.length > 0) {
                    console.warn("CSV parsing errors:", parseResult.errors);
                }

                originalCsvRows = parseResult.data;
                if (originalCsvRows.length === 0) {
                    throw new Error("The uploaded CSV file is empty.");
                }

                // Find the email column. We support various column headers:
                // "E-mail 1 - Value", "E-mail 2 - Value", "Email", "E-mail", "Email Address", etc.
                const headers = Object.keys(originalCsvRows[0]);
                const emailHeader = headers.find(h => {
                    const normalized = h.toLowerCase().trim();
                    return normalized === "e-mail 1 - value" || 
                           normalized === "email" || 
                           normalized === "e-mail" || 
                           normalized === "email address" ||
                           normalized.includes("email 1") ||
                           normalized.includes("email_value");
                });

                if (!emailHeader) {
                    throw new Error("Could not find an email column in the CSV (e.g. 'E-mail 1 - Value', 'Email').");
                }

                emailColumnName = emailHeader;
                emails = originalCsvRows.map(row => row[emailColumnName]?.trim()).filter(Boolean);

                if (emails.length === 0) {
                    throw new Error(`The column '${emailColumnName}' contains no email addresses.`);
                }
            }

            setBulkProgress(`Sending ${emails.length} invites...`);

            const resolvedMarketId = (currentUser?.role === "MARKET_MANAGER" && currentUser?.managedMarketId)
                ? currentUser.managedMarketId
                : bulkMarketId;

            const res = await fetch("/api/invites/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emails,
                    role: bulkRole,
                    marketId: resolvedMarketId,
                    hourlyWage: bulkHourlyWage
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to process bulk invites");
            }

            const results = data.results || [];
            setBulkResults(results);

            const successes = results.filter((r: any) => r.success).length;
            const failures = results.length - successes;
            
            setSuccess(`Bulk invites complete! Sent: ${successes}, Failed: ${failures}`);

            // If we uploaded a CSV, generate the updated CSV download
            if (bulkTab === "upload" && originalCsvRows.length > 0 && emailColumnName) {
                // Map results back to original rows
                const resultMap = new Map(results.map((r: any) => [r.email.toLowerCase(), r.inviteLink || ""]));
                
                // We need to add the invite link to the correct column
                // Let's look for "Invite links" or "Invite link" or create it
                const headers = Object.keys(originalCsvRows[0]);
                let inviteLinkHeader = headers.find(h => h.toLowerCase().trim() === "invite links" || h.toLowerCase().trim() === "invite link");
                if (!inviteLinkHeader) {
                    inviteLinkHeader = "Invite links";
                }

                const updatedRows = originalCsvRows.map(row => {
                    const rowEmail = row[emailColumnName]?.trim().toLowerCase();
                    const inviteLink = rowEmail ? (resultMap.get(rowEmail) || "") : "";
                    return {
                        ...row,
                        [inviteLinkHeader]: inviteLink
                    };
                });

                // Generate new CSV text
                const updatedCsvText = Papa.unparse(updatedRows);
                
                // Create a blob and download it
                const blob = new Blob([updatedCsvText], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `invites_updated_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            // Clear inputs on success
            setBulkEmailsText("");
            setBulkFile(null);
            // Reset file input if exists
            const fileInput = document.getElementById("bulk-file-input") as HTMLInputElement;
            if (fileInput) fileInput.value = "";

            // Refresh user list
            fetchUsers();
        } catch (err: any) {
            setError(err.message || "An error occurred during bulk invite processing.");
        } finally {
            setBulkProcessing(false);
            setBulkProgress("");
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
                <div>
                    <h1 className="heading h2">User Management</h1>
                    <p className="text-secondary">Onboard team members and manage active accounts.</p>
                </div>
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
                </div>
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

                {/* Bulk Onboarding Section */}
                <section className="card glass animate-fade-in" style={{ marginTop: "1.5rem" }}>
                    <h3 className="heading h4">Bulk Invite Team Members</h3>
                    <p className="text-secondary" style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                        Onboard multiple Workers/Tasters simultaneously. Automatic invite emails will be sent.
                    </p>

                    <div className={styles.tabContainer}>
                        <button
                            type="button"
                            className={`${styles.tabButton} ${bulkTab === "paste" ? styles.tabButtonActive : ""}`}
                            onClick={() => setBulkTab("paste")}
                        >
                            Paste Emails
                        </button>
                        <button
                            type="button"
                            className={`${styles.tabButton} ${bulkTab === "upload" ? styles.tabButtonActive : ""}`}
                            onClick={() => setBulkTab("upload")}
                        >
                            Upload CSV File
                        </button>
                    </div>

                    <form onSubmit={handleBulkInvite} className={styles.bulkForm}>
                        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                            <div className={styles.inputGroup} style={{ flex: "1", minWidth: "200px" }}>
                                <label>Role</label>
                                <select
                                    className="input"
                                    value={bulkRole}
                                    onChange={e => setBulkRole(e.target.value)}
                                >
                                    <option value="WORKER">Worker (Taster)</option>
                                    {currentUser?.role === "ADMIN" && (
                                        <option value="MARKET_MANAGER">Market Manager</option>
                                    )}
                                </select>
                            </div>

                            {(bulkRole === "WORKER" || bulkRole === "MARKET_MANAGER") && (
                                <div className={styles.inputGroup} style={{ flex: "1.5", minWidth: "200px" }}>
                                    <label>{bulkRole === "WORKER" ? "Assigned Market" : "Managed Market"}</label>
                                    <select
                                        className="input"
                                        value={bulkMarketId}
                                        onChange={e => setBulkMarketId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Market...</option>
                                        {markets.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className={styles.inputGroup} style={{ width: bulkRole === "WORKER" ? "120px" : "160px" }}>
                                <label>{bulkRole === "WORKER" ? "Pay/Hr" : "Monthly Salary"}</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="input"
                                    placeholder={bulkRole === "WORKER" ? "20.00" : "5000.00"}
                                    value={bulkHourlyWage}
                                    onChange={e => setBulkHourlyWage(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {bulkTab === "paste" ? (
                            <div className={styles.inputGroup}>
                                <label>Email Addresses</label>
                                <textarea
                                    className="input"
                                    rows={5}
                                    placeholder="Enter email addresses separated by commas or newlines (e.g. worker1@example.com, worker2@example.com)"
                                    value={bulkEmailsText}
                                    onChange={e => setBulkEmailsText(e.target.value)}
                                    style={{ fontFamily: "monospace", fontSize: "0.875rem", padding: "0.75rem" }}
                                    required={bulkTab === "paste"}
                                />
                            </div>
                        ) : (
                            <div className={styles.inputGroup} style={{ border: "2px dashed #cbd5e1", padding: "2rem", borderRadius: "8px", textAlign: "center", background: "#f8fafc" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", cursor: "pointer" }}>
                                    <span style={{ display: "block", fontSize: "1.25rem", marginBottom: "0.5rem" }}>📁</span>
                                    <strong>Click to upload</strong> or drag and drop a CSV file
                                    <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
                                        Must contain an email column (e.g. "E-mail 1 - Value" or "Email")
                                    </span>
                                </label>
                                <input
                                    id="bulk-file-input"
                                    type="file"
                                    accept=".csv"
                                    onChange={e => setBulkFile(e.target.files?.[0] || null)}
                                    style={{ display: "inline-block", marginTop: "1rem" }}
                                    required={bulkTab === "upload"}
                                />
                                {bulkFile && (
                                    <div style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#1e293b" }}>
                                        Selected: <strong>{bulkFile.name}</strong> ({(bulkFile.size / 1024).toFixed(1)} KB)
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={bulkProcessing}
                            className="btn btn-primary"
                            style={{ height: "46px", marginTop: "0.5rem" }}
                        >
                            {bulkProcessing ? bulkProgress || "Processing..." : "Generate & Send Bulk Invites"}
                        </button>
                    </form>

                    {bulkResults && bulkResults.length > 0 && (
                        <div className="card" style={{ marginTop: "1.5rem", padding: "1rem", background: "#f8fafc", border: "1px solid #e2e8f0", overflowX: "auto" }}>
                            <h4 style={{ margin: "0 0 1rem 0", fontSize: "0.9rem", color: "#0f172a" }}>Onboarding Results</h4>
                            <table style={{ width: "100%", fontSize: "0.75rem", borderCollapse: "collapse", textAlign: "left" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                                        <th style={{ padding: "0.5rem" }}>Email</th>
                                        <th style={{ padding: "0.5rem" }}>Status</th>
                                        <th style={{ padding: "0.5rem" }}>Invite Link</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bulkResults.map((r, i) => (
                                        <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                            <td style={{ padding: "0.5rem", fontWeight: "500" }}>{r.email}</td>
                                            <td style={{ padding: "0.5rem" }}>
                                                {r.success ? (
                                                    <span style={{ color: "#16a34a", fontWeight: "bold" }}>
                                                        ✓ Created {r.emailSent ? "(Email Sent)" : "(No Email)"}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: "#dc2626", fontWeight: "bold" }}>
                                                        ✗ Failed: {r.error}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: "0.5rem", fontFamily: "monospace", wordBreak: "break-all" }}>
                                                {r.inviteLink ? (
                                                    <a href={r.inviteLink} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>
                                                        {r.inviteLink}
                                                    </a>
                                                ) : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={9} className="text-center" style={{ padding: "3rem" }}>No team members found.</td></tr>
                            ) : filteredUsers.map(user => {
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
        ? `$${((user.workedHours * (user.hourlyWage || 0)) + (user.totalReimbursement || 0) + (user.totalBonus || 0)).toFixed(2)}`
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
