"use client";

import Link from "next/link";
import styles from "./admin.module.css";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
                <div className={styles.mobileTitle}>Workforce OS</div>
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
                    <LogoutButton />
                </div>
            </aside>
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
