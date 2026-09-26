"use client";

import { useMemo, useState } from "react";
import styles from "./reports.module.css";
import Link from "next/link";
import { isCanonicalCycle } from "@/lib/cycles";

const getLastName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    return parts[parts.length - 1] || "";
};

export interface PayrollPaymentInfo {
    paidAt: string;
    amountPaid: number;
    hoursPaid: number;
    periodStart: string;
    periodEnd: string;
}

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
    payment?: PayrollPaymentInfo | null;
    overlappingPayments?: PayrollPaymentInfo[];
}

interface PayrollTableProps {
    data: PayrollMember[];
    isLoading: boolean;
    startDate: string;
    endDate: string;
    onPaymentChange?: (workerId: string, payment: PayrollPaymentInfo | null) => void;
}

// datetime-local wants the viewer's *local* wall-clock time — toISOString() would be UTC.
const toLocalInputValue = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatPaidAt = (iso: string) =>
    new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

// Period strings are calendar dates, not instants — format them in UTC so they never shift a day.
const formatPeriod = (start: string, end: string) => {
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", timeZone: "UTC" };
    return `${new Date(`${start}T00:00:00Z`).toLocaleDateString(undefined, opts)} – ${new Date(`${end}T00:00:00Z`).toLocaleDateString(undefined, opts)}`;
};

const money = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type ModalState =
    | { mode: "mark"; member: PayrollMember; value: string }
    | { mode: "unmark"; member: PayrollMember };

export default function PayrollTable({ data, isLoading, startDate, endDate, onPaymentChange }: PayrollTableProps) {
    const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);
    const [modal, setModal] = useState<ModalState | null>(null);
    const [modalError, setModalError] = useState("");
    const [saving, setSaving] = useState(false);

    const canonical = isCanonicalCycle(startDate, endDate);

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

    const openMark = (member: PayrollMember) => {
        const initial = member.payment ? new Date(member.payment.paidAt) : new Date();
        setModalError("");
        setModal({ mode: "mark", member, value: toLocalInputValue(initial) });
    };

    const openUnmark = (member: PayrollMember) => {
        setModalError("");
        setModal({ mode: "unmark", member });
    };

    const closeModal = () => {
        if (!saving) setModal(null);
    };

    const submitModal = async () => {
        if (!modal) return;
        const { member } = modal;
        setModalError("");

        let body: any = { workerId: member.id, startDate, endDate };
        if (modal.mode === "mark") {
            const paidAt = new Date(modal.value);
            if (!modal.value || isNaN(paidAt.getTime())) {
                setModalError("Please enter a valid date and time.");
                return;
            }
            if (paidAt > new Date()) {
                setModalError("Paid date and time cannot be in the future.");
                return;
            }
            body = { ...body, paidAt: paidAt.toISOString(), amountPaid: member.payForCycle, hoursPaid: member.worked };
        }

        setSaving(true);
        try {
            const res = await fetch("/api/admin/reports/payroll/paid", {
                method: modal.mode === "mark" ? "PUT" : "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const result = await res.json().catch(() => ({}));
            if (!res.ok) {
                setModalError(result.error || "Something went wrong. Please try again.");
                return;
            }
            onPaymentChange?.(member.id, modal.mode === "mark" ? result.payment : null);
            setModal(null);
        } catch {
            setModalError("Network error. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const renderPaidCell = (member: PayrollMember) => {
        if (member.role !== "WORKER") return "N/A";

        if (!canonical) {
            return (
                <div className={styles.paidCell}>
                    <span className={styles.paidHint}>Pick a pay cycle to mark paid</span>
                    {(member.overlappingPayments || []).map(p => (
                        <span key={p.periodStart} className={styles.paidHint}>
                            Paid for {formatPeriod(p.periodStart, p.periodEnd)} on {formatPaidAt(p.paidAt)}
                        </span>
                    ))}
                </div>
            );
        }

        const p = member.payment;
        const mismatch = p && (Math.abs(p.amountPaid - member.payForCycle) > 0.01 || Math.abs(p.hoursPaid - member.worked) > 0.01);

        return (
            <div className={styles.paidCell}>
                <button
                    type="button"
                    role="switch"
                    aria-checked={!!p}
                    aria-label={`Paid — ${member.name}`}
                    className={`${styles.paidToggle} ${p ? styles.paidToggleOn : ""}`}
                    onClick={() => (p ? openUnmark(member) : openMark(member))}
                >
                    <span className={styles.paidKnob} />
                </button>
                {p && (
                    <button type="button" className={styles.paidLabel} onClick={() => openMark(member)} title="Edit paid date and time">
                        Paid {formatPaidAt(p.paidAt)} · {money(p.amountPaid)}
                    </button>
                )}
                {mismatch && (
                    <span className={styles.paidWarn}>
                        ⚠ Total changed since paid ({money(p!.amountPaid)} → {money(member.payForCycle)})
                    </span>
                )}
            </div>
        );
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
                        <th>PAID</th>
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
                                    {member.role === "WORKER" ? money(member.payForCycle) : 'N/A'}
                                </span>
                            </td>
                            <td>
                                <span className={styles.payAmount}>
                                    {member.role === "WORKER" ? money(member.taxablePay) : 'N/A'}
                                </span>
                            </td>
                            <td>{renderPaidCell(member)}</td>
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

            {modal && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>
                            {modal.mode === "mark"
                                ? `${modal.member.payment ? "Edit payment for" : "Mark"} ${modal.member.name}${modal.member.payment ? "" : " as paid"}`
                                : `Mark ${modal.member.name} as unpaid?`}
                        </h3>
                        <p className={styles.modalSubtitle}>
                            Pay cycle {formatPeriod(startDate, endDate)} · {money(modal.member.payForCycle)}
                        </p>

                        {modal.mode === "mark" ? (
                            <label className={styles.modalField}>
                                <span>Paid on (date and time)</span>
                                <input
                                    type="datetime-local"
                                    className={styles.dateInput}
                                    value={modal.value}
                                    max={toLocalInputValue(new Date())}
                                    onChange={(e) => {
                                        setModal({ ...modal, value: e.target.value });
                                        setModalError("");
                                    }}
                                    autoFocus
                                />
                            </label>
                        ) : (
                            <p className={styles.modalBody}>
                                This removes the paid record from {formatPaidAt(modal.member.payment!.paidAt)}.
                            </p>
                        )}

                        {modalError && <p className={styles.modalError}>{modalError}</p>}

                        <div className={styles.modalActions}>
                            <button type="button" className={styles.viewBtn} onClick={closeModal} disabled={saving}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={modal.mode === "mark" ? styles.reportBtn : styles.dangerBtn}
                                onClick={submitModal}
                                disabled={saving}
                            >
                                {saving ? "Saving…" : modal.mode === "mark" ? "Save" : "Mark unpaid"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
