"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import WorkerDashboard from "@/components/WorkerDashboard";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("WORKER");
    const [inviteResult, setInviteResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [marketStats, setMarketStats] = useState<any>(null);
    const [myShifts, setMyShifts] = useState<{ 
        upcoming: any[], 
        currentCycle: any[], 
        cycleStart?: string, 
        cycleEnd?: string,
        pendingReleases?: string[] 
    }>({ 
        upcoming: [], 
        currentCycle: [],
        pendingReleases: []
    });
    const [openShifts, setOpenShifts] = useState<any[]>([]);
    const [activeAssignment, setActiveAssignment] = useState<any>(null);
    const router = useRouter();

    const fetchWorkerData = useCallback(async () => {
        const [clockRes, shiftsRes, openRes] = await Promise.all([
            fetch("/api/timeclock"),
            fetch("/api/jobs/my-shifts"),
            fetch("/api/jobs/open-shifts")
        ]);
        if (clockRes.ok) setActiveAssignment((await clockRes.json()).activeAssignment);
        if (shiftsRes.ok) setMyShifts(await shiftsRes.json());
        if (openRes.ok) setOpenShifts(await openRes.json());
    }, []);

    const fetchMarketStats = useCallback(async () => {
        const res = await fetch("/api/reports/market-summary");
        if (res.ok) {
            const data = await res.json();
            setMarketStats(data);
        }
    }, []);

    useEffect(() => {
        async function fetchUser() {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                if (data.user.role === "MARKET_MANAGER") {
                    fetchMarketStats();
                } else if (data.user.role === "WORKER") {
                    fetchWorkerData();
                }
            } else {
                router.push("/login");
            }
        }

        fetchUser();
    }, [router, fetchWorkerData, fetchMarketStats]);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setInviteResult("");
        try {
            const res = await fetch("/api/invites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            });
            const data = await res.json();
            if (res.ok) {
                setInviteResult(`Invite sent! Link: ${data.inviteLink}`);
                setInviteEmail("");
            } else {
                setInviteResult(`Error: ${data.error}`);
            }
        } catch (err) {
            setInviteResult("Failed to send invite");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="container" style={{ padding: "2rem" }}>Loading...</div>;

    if (user.role === "WORKER") {
        return (
            <WorkerDashboard
                user={user}
                activeAssignment={activeAssignment}
                myShifts={myShifts}
                openShifts={openShifts}
                onRefresh={fetchWorkerData}
                onLogout={handleLogout}
            />
        );
    }

    return (
        <div className="container" style={{ padding: "2rem" }}>
            <header className="flex justify-between items-center glass card animate-fade-in" style={{ marginBottom: "2rem" }}>
                <div>
                    <h1 className="heading">Workforce OS</h1>
                    <p style={{ color: "var(--secondary)" }}>Welcome back, {user.name} ({user.role})</p>
                </div>
                <button onClick={handleLogout} className="btn btn-primary" style={{ background: "var(--danger)" }}>
                    Logout
                </button>
            </header>

            <main className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                <div className="card animate-fade-in" style={{ animationDelay: "100ms" }}>
                    <h2 className="heading h3">Getting Started</h2>
                    <p style={{ color: "var(--secondary)", marginTop: "0.5rem" }}>
                        You are logged in to the Workforce & Event Job Management System.
                    </p>
                </div>

                {user.role === "ADMIN" && (
                    <div className="card animate-fade-in" style={{ animationDelay: "200ms" }}>
                        <h2 className="heading h3">Quick Invite</h2>
                        <form onSubmit={handleInvite} className="flex-column gap-2" style={{ marginTop: "1rem", display: "flex" }}>
                            <input
                                type="email"
                                placeholder="Worker email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="card"
                                style={{ padding: "0.5rem", width: "100%", marginBottom: "0.5rem" }}
                                required
                            />
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                                className="card"
                                style={{ padding: "0.5rem", width: "100%", marginBottom: "0.5rem" }}
                            >
                                <option value="WORKER">Worker</option>
                                <option value="MARKET_MANAGER">Market Manager</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                            <button type="submit" disabled={loading} className="btn btn-primary">
                                {loading ? "Sending..." : "Send Invite"}
                            </button>
                            {inviteResult && (
                                <p style={{
                                    marginTop: "0.5rem",
                                    fontSize: "0.875rem",
                                    wordBreak: "break-all",
                                    color: inviteResult.startsWith("Error") ? "var(--danger)" : "var(--success)"
                                }}>
                                    {inviteResult}
                                </p>
                            )}
                        </form>
                    </div>
                )}
                {user.role === "MARKET_MANAGER" && (
                    <>
                        <div className="card animate-fade-in" style={{ animationDelay: "200ms" }}>
                            <h2 className="heading h3">Market Overview</h2>
                            {marketStats ? (
                                <div className="grid gap-2" style={{ marginTop: "1rem", gridTemplateColumns: "1fr 1fr" }}>
                                    <div className="card" style={{ padding: "1rem", background: "var(--bg-secondary)" }}>
                                        <p style={{ fontSize: "0.75rem", color: "var(--secondary)" }}>Total Stores</p>
                                        <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{marketStats.totalStores}</p>
                                    </div>
                                    <div className="card" style={{ padding: "1rem", background: "var(--bg-secondary)" }}>
                                        <p style={{ fontSize: "0.75rem", color: "var(--secondary)" }}>Total Workers</p>
                                        <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{marketStats.totalWorkers}</p>
                                    </div>
                                    <div className="card" style={{ padding: "1rem", background: "var(--bg-secondary)" }}>
                                        <p style={{ fontSize: "0.75rem", color: "var(--secondary)" }}>Jobs Today</p>
                                        <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{marketStats.jobsToday}</p>
                                    </div>
                                    <div className="card" style={{ padding: "1rem", background: "var(--bg-secondary)" }}>
                                        <p style={{ fontSize: "0.75rem", color: "var(--secondary)" }}>Active Shifts</p>
                                        <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{marketStats.activeShifts}</p>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ marginTop: "1rem" }}>Loading stats...</p>
                            )}
                        </div>

                        <div className="card animate-fade-in" style={{ animationDelay: "300ms" }}>
                            <h2 className="heading h3">Management</h2>
                            <div className="flex-column gap-2" style={{ marginTop: "1rem", display: "flex" }}>
                                <button onClick={() => router.push("/admin/dashboard")} className="btn btn-primary" style={{ width: "100%" }}>
                                    View Manager Dashboard
                                </button>
                                <button onClick={() => router.push("/admin/users")} className="btn btn-primary" style={{ width: "100%", background: "var(--secondary)" }}>
                                    Manage Regional Team
                                </button>
                                <button onClick={() => router.push("/admin/jobs")} className="btn btn-primary" style={{ width: "100%", background: "var(--accent)" }}>
                                    Schedule Market Jobs
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
