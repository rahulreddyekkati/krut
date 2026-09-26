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
    onPaymentsChange?: (payments: Record<string, PayrollPaymentInfo | null>) => void;
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
    | { mode: "mark"; value: string }
    | { mode: "unmark" };

export default function PayrollTable({ data, isLoading, startDate, endDate, onPaymentsChange }: PayrollTableProps) {
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

    // The one Paid switch applies to every worker currently listed (Market / Active-only filters included).
    const workers = useMemo(() => (data || []).filter(m => m.role === "WORKER"), [data]);
    const paidWorkers = workers.filter(m => m.payment);
    const allPaid = workers.length > 0 && paidWorkers.length === workers.length;
    const paidTimes = new Set(paidWorkers.map(m => m.payment!.paidAt));
    const sharedPaidAt = paidTimes.size === 1 ? [...paidTimes][0] : null;
    const totalPaid = paidWorkers.reduce((sum, m) => sum + m.payment!.amountPaid, 0);
    const changedSincePaid = paidWorkers.filter(m =>
        Math.abs(m.payment!.amountPaid - m.payForCycle) > 0.01 || Math.abs(m.payment!.hoursPaid - m.worked) > 0.01
    );
    const overlapping = workers.flatMap(m => m.overlappingPayments || []);
    const overlapPeriods = [...new Map(overlapping.map(p => [`${p.periodStart}|${p.periodEnd}`, p])).values()];

    const openMark = () => {
        const initial = sharedPaidAt ? new Date(sharedPaidAt) : new Date();
        setModalError("");
        setModal({ mode: "mark", value: toLocalInputValue(initial) });
    };

    const openUnmark = () => {
        setModalError("");
        setModal({ mode: "unmark" });
    };

    const closeModal = () => {
        if (!saving) setModal(null);
    };

    const submitModal = async () => {
        if (!modal) return;
        setModalError("");

        let body: any;
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
            body = {
                startDate,
                endDate,
                paidAt: paidAt.toISOString(),
                workers: workers.map(m => ({ workerId: m.id, amountPaid: m.payForCycle, hoursPaid: m.worked })),
            };
        } else {
            body = { startDate, endDate, workerIds: paidWorkers.map(m => m.id) };
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
            if (modal.mode === "mark") {
                onPaymentsChange?.(result.payments || {});
            } else {
                onPaymentsChange?.(Object.fromEntries(paidWorkers.map(m => [m.id, null])));
            }
            setModal(null);
        } catch {
            setModalError("Network error. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const renderPaidBar = () => {
        if (workers.length === 0) return null;

        if (!canonical) {
            return (
                <div className={styles.paidBar}>
                    <div className={styles.paidBarText}>
                        <strong>Paid</strong>
                        <span className={styles.paidHint}>Pick a pay cycle to mark this payroll as paid.</span>
                        {overlapPeriods.map(p => (
                            <span key={`${p.periodStart}|${p.periodEnd}`} className={styles.paidHint}>
                                {overlapping.filter(o => o.periodStart === p.periodStart && o.periodEnd === p.periodEnd).length} of these
                                workers were paid for {formatPeriod(p.periodStart, p.periodEnd)}.
                            </span>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className={`${styles.paidBar} ${allPaid ? styles.paidBarOn : ""}`}>
                <button
                    type="button"
                    role="switch"
                    aria-checked={allPaid}
                    aria-label="Paid — all listed workers"
                    className={`${styles.paidToggle} ${allPaid ? styles.paidToggleOn : ""}`}
                    onClick={() => (allPaid ? openUnmark() : openMark())}
                >
                    <span className={styles.paidKnob} />
                </button>
                <div className={styles.paidBarText}>
                    <strong>{allPaid ? "Paid" : "Mark payroll as paid"}</strong>
                    {allPaid ? (
                        <span>
                            {sharedPaidAt ? `on ${formatPaidAt(sharedPaidAt)}` : "(different times)"}
                            {" · "}{workers.length} worker{workers.length === 1 ? "" : "s"} · {money(totalPaid)}
                        </span>
                    ) : paidWorkers.length > 0 ? (
                        <span>{paidWorkers.length} of {workers.length} listed workers paid</span>
                    ) : (
                        <span className={styles.paidHint}>
                            Applies to all {workers.length} worker{workers.length === 1 ? "" : "s"} listed below
                        </span>
                    )}
                    {changedSincePaid.length > 0 && (
                        <span className={styles.paidWarn}>
                            ⚠ Total changed since paid for {changedSincePaid.map(m =>
                                `${m.name} (${money(m.payment!.amountPaid)} → ${money(m.payForCycle)})`
                            ).join(", ")}
                        </span>
                    )}
                </div>
                {allPaid && (
                    <button type="button" className={styles.viewBtn} onClick={openMark}>
                        Edit time
                    </button>
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
        <>
        {renderPaidBar()}
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
                                    {member.role === "WORKER" ? money(member.payForCycle) : 'N/A'}
                                </span>
                            </td>
                            <td>
                                <span className={styles.payAmount}>
                                    {member.role === "WORKER" ? money(member.taxablePay) : 'N/A'}
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

            {modal && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>
                            {modal.mode === "mark"
                                ? `${allPaid ? "Edit paid time for" : "Mark as paid:"} ${workers.length} worker${workers.length === 1 ? "" : "s"}`
                                : `Mark ${paidWorkers.length} worker${paidWorkers.length === 1 ? "" : "s"} as unpaid?`}
                        </h3>
                        <p className={styles.modalSubtitle}>
                            Pay cycle {formatPeriod(startDate, endDate)} · {money(
                                (modal.mode === "mark" ? workers : paidWorkers).reduce((sum, m) => sum + m.payForCycle, 0)
                            )} total
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
                                This removes the paid record for every worker listed in this report.
                            </p>
                        )}

                        {modal.mode === "mark" && (
                            <p className={styles.modalBody} style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#6b7280" }}>
                                Applies to every worker currently listed (respects the Market and Active-only filters).
                                {paidWorkers.length > 0 && !allPaid && ` ${paidWorkers.length} already-paid worker${paidWorkers.length === 1 ? "" : "s"} will get this time too.`}
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
        </>
    );
}
