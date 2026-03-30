"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./reports.module.css";
import { getClosedCycles } from "@/lib/cycles";
import PayrollTable from "./PayrollTable";
import AnalyticsDashboard from "./AnalyticsDashboard";

export default function AdminReportsPage() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [activeTab, setActiveTab] = useState("analytics");
    const [selectedCycle, setSelectedCycle] = useState<string>("");
    const [payrollData, setPayrollData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Memoize cycles to avoid unnecessary recalculations
    const closedCycles = useMemo(() => getClosedCycles(12), []);

    // Set initial cycle on mount
    useEffect(() => {
        if (closedCycles.length > 0 && selectedCycle === "") {
            setSelectedCycle(closedCycles[0].label);
        }
    }, [closedCycles]);

    // Re-sync dates when cycle changes or tab changes
    useEffect(() => {
        if (activeTab === "pay-reports" && selectedCycle !== "manual" && selectedCycle !== "") {
            const cycle = closedCycles.find(c => c.label === selectedCycle);
            if (cycle) {
                const formatDate = (date: Date) => {
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, '0');
                    const d = String(date.getDate()).padStart(2, '0');
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

    const fetchPayrollData = async () => {
        if (!startDate || !endDate) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/reports/payroll?startDate=${startDate}&endDate=${endDate}`);
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
                                <div className={styles.headerRow}>
                                    <label className="text-secondary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>Pay Cycle</label>
                                    <select 
                                        className={styles.dateInput} 
                                        value={selectedCycle}
                                        onChange={handleCycleChange}
                                        style={{ minWidth: "180px" }}
                                    >
                                        <option value="manual">Manual Range</option>
                                        {closedCycles.map(cycle => (
                                            <option key={cycle.label} value={cycle.label}>
                                                {cycle.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className={styles.headerRow}>
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
                            <div className={styles.headerRow}>
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
                    <PayrollTable data={payrollData} isLoading={isLoading} startDate={startDate} endDate={endDate} />
                )}
            </div>
        </div>
    );
}
