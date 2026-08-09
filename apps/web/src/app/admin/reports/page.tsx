"use client";

import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import styles from "./reports.module.css";
import { getClosedCycles } from "@/lib/cycles";
import PayrollTable from "./PayrollTable";
import AnalyticsDashboard from "./AnalyticsDashboard";

const getLastName = (fullName: string) => {
    const parts = (fullName || "").trim().split(/\s+/);
    return parts[parts.length - 1] || "";
};

export default function AdminReportsPage() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [activeTab, setActiveTab] = useState("analytics");
    const [selectedCycle, setSelectedCycle] = useState<string>("");
    const [payrollData, setPayrollData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [markets, setMarkets] = useState<any[]>([]);
    const [selectedMarket, setSelectedMarket] = useState<string>("all");
    const [activeOnly, setActiveOnly] = useState(false);

    // Memoize cycles to avoid unnecessary recalculations
    const closedCycles = useMemo(() => getClosedCycles(24), []);

    // Set initial cycle on mount
    useEffect(() => {
        if (closedCycles.length > 0 && selectedCycle === "") {
            setSelectedCycle(closedCycles[0].label);
        }
    }, [closedCycles]);

    // Fetch markets on mount
    useEffect(() => {
        const fetchMarkets = async () => {
            try {
                const res = await fetch("/api/markets");
                if (res.ok) {
                    setMarkets(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch markets", error);
            }
        };
        fetchMarkets();
    }, []);

    // Re-sync dates when cycle changes or tab changes
    useEffect(() => {
        if (activeTab === "pay-reports" && selectedCycle !== "manual" && selectedCycle !== "") {
            const cycle = closedCycles.find(c => c.label === selectedCycle);
            if (cycle) {
                // cycles.ts builds cycle.start/end with Date.UTC(...) (a calendar-day marker,
                // not a real local instant) — must read it back with UTC getters, or a
                // browser west of UTC would derive the day *before* the intended one.
                const formatDate = (date: Date) => {
                    const y = date.getUTCFullYear();
                    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
                    const d = String(date.getUTCDate()).padStart(2, '0');
                    return `${y}-${m}-${d}`;
                };
                setStartDate(formatDate(cycle.start));
                setEndDate(formatDate(cycle.end));
            }
        }
    }, [selectedCycle, activeTab, closedCycles]);

    const handleCycleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedCycle(val);
    };

    const handleExportExcel = () => {
        const rows = [...filteredPayrollData]
            .sort((a, b) => getLastName(a.name).localeCompare(getLastName(b.name), undefined, { sensitivity: "base" }))
            .map(member => ({
                "Name": member.name,
                "Role": member.role,
                "Location/Scope": member.location,
                "Pay/Hr": member.payHr,
                "Worked (hrs)": member.worked,
                "Assigned (hrs)": member.assigned,
                "Reimbursement": member.reimb,
                "Bottles Sold": member.role === "WORKER" ? member.bottlesSold : "N/A",
                "Pay For Cycle": member.role === "WORKER" ? member.payForCycle : "N/A",
                "Taxable Pay": member.role === "WORKER" ? member.taxablePay : "N/A",
            }));

        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [
            { wch: 22 }, { wch: 16 }, { wch: 20 }, { wch: 10 },
            { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 13 }, { wch: 14 }, { wch: 14 }
        ];

        // Apply currency formatting to Pay/Hr (D), Reimbursement (G), Pay For Cycle (I), Taxable Pay (J)
        const currencyCols = ["D", "G", "I", "J"];
        const range = XLSX.utils.decode_range(ws['!ref'] || "A1");
        for (let r = range.s.r + 1; r <= range.e.r; r++) {
            for (const col of currencyCols) {
                const cell = ws[`${col}${r + 1}`];
                if (cell && typeof cell.v === "number") {
                    cell.z = '"$"#,##0.00';
                }
            }
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Payroll");

        const cycleLabel = selectedCycle && selectedCycle !== "manual"
            ? selectedCycle.replace(/\s+/g, "")
            : `${startDate}_to_${endDate}`;
        const marketLabel = selectedMarket === "all" ? "AllMarkets" : selectedMarket.replace(/\s+/g, "");
        XLSX.writeFile(wb, `Payroll_${marketLabel}_${cycleLabel}.xlsx`);
    };

    const fetchPayrollData = async () => {
        if (!startDate || !endDate) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/reports/payroll?startDate=${startDate}&endDate=${endDate}`, {
                headers: {
                    "x-timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
                    "x-timezone-offset": new Date().getTimezoneOffset().toString()
                }
            });
            if (res.ok) {
                setPayrollData(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch payroll data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "pay-reports") {
            fetchPayrollData();
        }
    }, [startDate, endDate, activeTab]);

    // Filter payroll data by selected market
    const filteredPayrollData = useMemo(() => {
        let data = selectedMarket === "all"
            ? payrollData
            : payrollData.filter(member => member.location === selectedMarket);
        if (activeOnly) {
            data = data.filter(member => member.assigned > 0 && member.worked > 0 && member.payForCycle);
        }
        return data;
    }, [payrollData, selectedMarket, activeOnly]);

    return (
        <div>
            <div className={styles.headerCard}>
                <div className={styles.headerMain}>
                    <div>
                        <h1 className="heading h2">System Reports</h1>
                        <p className="text-secondary">Export Sales and Payroll data.</p>
                    </div>

                    <div className={styles.dateFilters}>
                        <div className={styles.filtersContainer}>
                            {activeTab === "pay-reports" && (
                                <>
                                    <div className={styles.filterField}>
                                        <label className="text-secondary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>Market</label>
                                        <select 
                                            className={styles.dateInput} 
                                            value={selectedMarket}
                                            onChange={(e) => setSelectedMarket(e.target.value)}
                                        >
                                            <option value="all">All Markets</option>
                                            {markets.map(market => (
                                                <option key={market.id} value={market.name}>
                                                    {market.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.filterField}>
                                        <label className="text-secondary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>Pay Cycle</label>
                                        <select 
                                            className={styles.dateInput} 
                                            value={selectedCycle}
                                            onChange={handleCycleChange}
                                        >
                                            <option value="manual">Manual Range</option>
                                            {closedCycles.map(cycle => (
                                                <option key={cycle.label} value={cycle.label}>
                                                    {cycle.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.checkboxField}>
                                        <label
                                            className="text-secondary"
                                            style={{ fontSize: "0.85rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", userSelect: "none" }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={activeOnly}
                                                onChange={(e) => setActiveOnly(e.target.checked)}
                                                style={{ width: "16px", height: "16px", cursor: "pointer" }}
                                            />
                                            Active only (worked &gt; 0, assigned &gt; 0, pay &gt; $0)
                                        </label>
                                    </div>
                                </>
                            )}
                            <div className={styles.filterField}>
                                <label className="text-secondary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>Start Date</label>
                                <input 
                                    type="date" 
                                    className={styles.dateInput}
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setSelectedCycle("manual");
                                    }}
                                />
                            </div>
                            <div className={styles.filterField}>
                                <label className="text-secondary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>End Date</label>
                                <input 
                                    type="date" 
                                    className={styles.dateInput}
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setSelectedCycle("manual");
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.tabBar}>
                    <button 
                        className={`${styles.tabButton} ${activeTab === 'analytics' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        Analytics
                    </button>
                    <button 
                        className={`${styles.tabButton} ${activeTab === 'pay-reports' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('pay-reports')}
                    >
                        Pay Reports
                    </button>
                </div>
            </div>

            <div className={styles.contentArea}>
                {activeTab === 'analytics' ? (
                    <AnalyticsDashboard startDate={startDate} endDate={endDate} />
                ) : (
                    <>
                        <PayrollTable data={filteredPayrollData} isLoading={isLoading} startDate={startDate} endDate={endDate} />
                        {!isLoading && filteredPayrollData.length > 0 && (
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                                <button
                                    onClick={handleExportExcel}
                                    style={{
                                        padding: "0.75rem 1.75rem",
                                        backgroundColor: "#16a34a",
                                        color: "white",
                                        fontWeight: 700,
                                        borderRadius: "10px",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "0.9rem",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
                                    }}
                                >
                                    📊 Export to Excel
                                </button>
                                <a
                                    href={`/admin/reports/payroll/print?startDate=${startDate}&endDate=${endDate}&market=${selectedMarket}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <button style={{
                                        padding: "0.75rem 1.75rem",
                                        backgroundColor: "#6366f1",
                                        color: "white",
                                        fontWeight: 700,
                                        borderRadius: "10px",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "0.9rem",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
                                    }}>
                                        🖨 Print Report
                                    </button>
                                </a>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
