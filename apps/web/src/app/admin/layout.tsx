"use client";

import Link from "next/link";
import styles from "./admin.module.css";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setError("");
        if (!current || !next || !confirm) { setError("All fields are required."); return; }
        if (next.length < 8) { setError("New password must be at least 8 characters."); return; }
        if (next !== confirm) { setError("New passwords do not match."); return; }
        setSaving(true);
        try {
            const res = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: current, newPassword: next }),
            });
            const data = await res.json();
            if (res.ok) { onClose(); }
            else { setError(data.error || "Failed to update password."); }
        } catch { setError("Network error. Please try again."); }
        finally { setSaving(false); }
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "1rem" }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 420, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", marginBottom: "1.5rem" }}>Change Password</h2>
                {error && <p style={{ color: "#EF4444", fontSize: "0.875rem", marginBottom: "1rem", background: "#FEF2F2", padding: "0.75rem", borderRadius: 8 }}>{error}</p>}
                {([["Current Password", current, setCurrent], ["New Password", next, setNext], ["Confirm New Password", confirm, setConfirm]] as [string, string, (v: string) => void][]).map(([label, val, setter]) => (
                    <div key={label} style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
                        <input type="password" value={val} onChange={e => setter(e.target.value)}
                            placeholder={label === "New Password" ? "Min. 8 characters" : ""}
                            style={{ width: "100%", padding: "0.75rem", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: "0.9375rem", color: "#111827", background: "#F9FAFB", boxSizing: "border-box" }} />
                    </div>
                ))}
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                    <button onClick={onClose} style={{ flex: 1, padding: "0.75rem", border: "1px solid #E5E7EB", borderRadius: 10, background: "#fff", color: "#374151", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                    <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: "0.75rem", border: "none", borderRadius: 10, background: saving ? "#A5B4FC" : "#6366F1", color: "#fff", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
                        {saving ? "Saving…" : "Update Password"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [stats, setStats] = useState({ role: "" });
    const [badges, setBadges] = useState({ recaps: 0, shiftApprovals: 0, releasedShifts: 0, messages: 0 });
    const pathname = usePathname();

    useEffect(() => {
        const fetchUserAndBadges = async () => {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                setStats({ role: data.user.role });
            }
            // Fetch badge counts
            const badgesRes = await fetch("/api/admin/notifications/counts");
            if (badgesRes.ok) {
                const b = await badgesRes.json();
                setBadges({ ...b });
            }
        };
        fetchUserAndBadges();
        
        // Polling every 30 seconds for live updates
        const intervalId = setInterval(async () => {
            const badgesRes = await fetch("/api/admin/notifications/counts");
            if (badgesRes.ok) {
                setBadges(await badgesRes.json());
            }
        }, 30000);
        return () => clearInterval(intervalId);
    }, []);

    // Close sidebar when navigating
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    const { role } = stats;
    const portalTitle = role === "ADMIN" ? "Admin Portal" : "Manager Portal";

    const isReportPage = pathname.includes("/admin/reports/payroll/user/");

    if (isReportPage) {
        return (
            <main style={{ width: "100%", minHeight: "100vh", backgroundColor: "white" }}>
                {children}
            </main>
        );
    }

    return (
        <div className={styles.layout}>
            {/* Mobile Header */}
            <div className={styles.mobileHeader}>
                <div className={styles.mobileTitle}>Kruto Tastes</div>
                <div className={styles.mobileActions}>
                    <Link href="/admin/messages" className={styles.iconBtn}>
                        <div className={styles.iconContainer}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span className={styles.badge}>2</span>
                        </div>
                    </Link>
                    <Link href="/admin/shift-release-approvals" className={styles.iconBtn}>
                        <div className={styles.iconContainer}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            <span className={styles.badge}>5</span>
                        </div>
                    </Link>
                    <button className={styles.iconBtn} onClick={() => setIsSidebarOpen(true)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && <div className={styles.overlay} onClick={() => setIsSidebarOpen(false)} />}

            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarActive : ""}`}>
                <div className={styles.logo}>
                    <h2 className="heading h4">{portalTitle}</h2>
                    <button className={`${styles.iconBtn} ${styles.closeMenu}`} onClick={() => setIsSidebarOpen(false)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <nav className={styles.nav}>
                    <Link href="/admin/dashboard" className={`${styles.navLink} ${pathname === '/admin/dashboard' ? styles.active : ''}`}>Dashboard</Link>
                    {role === "ADMIN" && <Link href="/admin/markets" className={`${styles.navLink} ${pathname === '/admin/markets' ? styles.active : ''}`}>Markets</Link>}
                    <Link href="/admin/stores" className={`${styles.navLink} ${pathname === '/admin/stores' ? styles.active : ''}`}>Stores</Link>
                    <Link href="/admin/users" className={`${styles.navLink} ${pathname === '/admin/users' ? styles.active : ''}`}>Users</Link>
                    <Link href="/admin/jobs" className={`${styles.navLink} ${pathname === '/admin/jobs' ? styles.active : ''}`}>Jobs</Link>
                    <Link href="/admin/inventory" className={`${styles.navLink} ${pathname === '/admin/inventory' ? styles.active : ''}`}>Inventory Items</Link>
                    <Link href="/admin/reports" className={`${styles.navLink} ${pathname === '/admin/reports' ? styles.active : ''}`}>Reports</Link>
                    <Link href="/admin/messages" className={`${styles.navLink} ${pathname === '/admin/messages' ? styles.active : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Messages
                        {badges.messages > 0 && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>}
                    </Link>
                    <Link href="/admin/recaps" className={`${styles.navLink} ${pathname === '/admin/recaps' ? styles.active : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Recaps
                        {badges.recaps > 0 && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>}
                    </Link>
                    <Link href="/admin/shift-release-approvals" className={`${styles.navLink} ${pathname === '/admin/shift-release-approvals' ? styles.active : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Shift Release Approvals
                        {badges.shiftApprovals > 0 && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>}
                    </Link>
                    <Link href="/admin/released-shifts" className={`${styles.navLink} ${pathname === '/admin/released-shifts' ? styles.active : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Released Shifts
                        {badges.releasedShifts > 0 && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>}
                    </Link>
                </nav>
                <div className={styles.sidebarFooter}>
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        style={{
                            width: "100%", padding: "0.75rem 1rem", marginBottom: "0.5rem",
                            background: "rgba(99,102,241,0.1)", color: "#6366f1",
                            border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8,
                            cursor: "pointer", fontWeight: 600, fontSize: "0.875rem"
                        }}
                    >
                        Change Password
                    </button>
                    <LogoutButton />
                </div>
            </aside>
            <main className={styles.main}>
                {children}
            </main>
            {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
        </div>
    );
}
