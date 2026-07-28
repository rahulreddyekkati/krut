"use client";

import { useMemo, useState } from "react";
import styles from "./reports.module.css";
import Link from "next/link";

const getLastName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    return parts[parts.length - 1] || "";
};

interface PayrollMember {
    id: string;
    name: string;
    role: string;
    location: string;
    payHr: number;
    worked: number;
    assigned: number;
    reimb: number;
    bottlesSold: number;
    payForCycle: number;
    taxablePay: number;
}

interface PayrollTableProps {
    data: PayrollMember[];
    isLoading: boolean;
    startDate: string;
    endDate: string;
}

export default function PayrollTable({ data, isLoading, startDate, endDate }: PayrollTableProps) {
    const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);

    const sortedData = useMemo(() => {
        if (!sortDir || !data) return data;
        const copy = [...data];
        copy.sort((a, b) => {
            const cmp = getLastName(a.name).localeCompare(getLastName(b.name), undefined, { sensitivity: "base" });
            return sortDir === "asc" ? cmp : -cmp;
        });
        return copy;
    }, [data, sortDir]);

    const toggleSort = () => {
        setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    };

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading payroll data...</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>No payroll data found for the selected period.</p>
            </div>
        );
    }

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.payrollTable}>
                <thead>
                    <tr>
                        <th onClick={toggleSort} style={{ cursor: "pointer", userSelect: "none" }} title="Sort by last name">
                            USER {sortDir === "asc" ? "▲" : sortDir === "desc" ? "▼" : ""}
                        </th>
                        <th>ROLE</th>
                        <th>LOCATION/SCOPE</th>
                        <th>PAY/HR</th>
                        <th>WORKED</th>
                        <th>ASSIGNED</th>
                        <th>REIMB.</th>
                        <th>BOTTLES SOLD</th>
                        <th>PAY FOR CYCLE</th>
                        <th title="Pay for Cycle minus Reimbursement — what should be reported as taxable income">TAXABLE PAY</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((member) => (
                        <tr key={member.id}>
                            <td>
                                <div className={styles.userInfo}>
                                    <div className={styles.userAvatar}>
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className={styles.userName}>{member.name}</span>
                                </div>
                            </td>
                            <td><span className={styles.roleBadge}>{member.role}</span></td>
                            <td>{member.location}</td>
                            <td>${member.payHr.toFixed(2)}</td>
                            <td>{member.worked} hrs</td>
                            <td>{member.assigned} hrs</td>
                            <td>${member.reimb.toFixed(2)}</td>
                            <td>{member.role === "WORKER" ? member.bottlesSold : "N/A"}</td>
                            <td>
                                <span className={styles.payAmount}>
                                    {member.role === "WORKER"
                                        ? `$${member.payForCycle.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        : 'N/A'}
                                </span>
                            </td>
                            <td>
                                <span className={styles.payAmount}>
                                    {member.role === "WORKER"
                                        ? `$${member.taxablePay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        : 'N/A'}
                                </span>
                            </td>
                            <td>
                                <div className={styles.actionButtons}>
                                    <Link href={`/admin/reports/payroll/user/${member.id}?startDate=${startDate}&endDate=${endDate}&print=true`} target="_blank">
                                        <button className={styles.reportBtn}>Report</button>
                                    </Link>
                                    <Link href={`/admin/reports/payroll/user/${member.id}?startDate=${startDate}&endDate=${endDate}`} target="_blank">
                                        <button className={styles.viewBtn}>View</button>
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
