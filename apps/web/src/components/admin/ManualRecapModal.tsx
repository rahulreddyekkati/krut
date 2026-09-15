"use client";

import React, { useEffect, useState } from "react";

type SkuRow = {
    itemId: string;
    name: string;
    beginning: string;
    purchased: string;
    sold: string;
    storePrice: string;
};

const emptyRow = (): SkuRow => ({ itemId: "", name: "", beginning: "0", purchased: "0", sold: "0", storePrice: "0" });

const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" };
const fieldWrap: React.CSSProperties = { marginBottom: "1rem" };

// Admin-facing "enter this shift's recap for them" modal — for a shift stuck in the
// Incomplete tab (no recap submitted, or a rejected one) where the worker instead
// handed in a paper recap. Mirrors the worker's own recap form, plus clock-time
// correction fields since these shifts often also have the wrong clockIn/clockOut.
export default function ManualRecapModal({
    row,
    onClose,
    onSaved,
}: {
    row: any;
    onClose: () => void;
    onSaved: () => void;
}) {
    const toDatetimeLocal = (dateStr: string | null) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const [clockIn, setClockIn] = useState(toDatetimeLocal(row.clockIn));
    const [clockOut, setClockOut] = useState(toDatetimeLocal(row.clockOut));
    const [breakTimeMinutes, setBreakTimeMinutes] = useState("0");
    const [rushLevel, setRushLevel] = useState("");
    const [customersSampled, setCustomersSampled] = useState("0");
    const [receiptTotal, setReceiptTotal] = useState("0");
    const [reimbursementTotal, setReimbursementTotal] = useState("0");
    const [comments, setComments] = useState("");

    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    const [skuRows, setSkuRows] = useState<SkuRow[]>([emptyRow()]);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/inventory")
            .then((res) => (res.ok ? res.json() : []))
            .then((items) => setInventoryItems(Array.isArray(items) ? items : []))
            .catch(() => setInventoryItems([]));
    }, []);

    const updateRow = (idx: number, patch: Partial<SkuRow>) => {
        setSkuRows((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
    };

    const handlePickItem = (idx: number, itemId: string) => {
        const item = inventoryItems.find((i) => i.id === itemId);
        updateRow(idx, { itemId, name: item ? item.name : "" });
    };

    const addRow = () => setSkuRows((rows) => [...rows, emptyRow()]);
    const removeRow = (idx: number) => setSkuRows((rows) => rows.filter((_, i) => i !== idx));

    const handleSubmit = async () => {
        setError("");
        setSubmitting(true);
        try {
            const inventoryData: Record<string, any> = {};
            skuRows
                .filter((r) => r.name)
                .forEach((r, i) => {
                    inventoryData[r.itemId || `row-${i}`] = {
                        name: r.name,
                        beginning: r.beginning,
                        purchased: r.purchased,
                        sold: r.sold,
                        storePrice: r.storePrice,
                    };
                });

            const res = await fetch(`/api/admin/assignments/${row.id}/manual-recap`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clockIn: clockIn ? new Date(clockIn).toISOString() : undefined,
                    clockOut: clockOut ? new Date(clockOut).toISOString() : undefined,
                    breakTimeMinutes,
                    rushLevel: rushLevel || undefined,
                    customersSampled,
                    receiptTotal,
                    reimbursementTotal,
                    comments: comments || undefined,
                    inventoryData,
                }),
            });

            if (res.ok) {
                onSaved();
                onClose();
            } else {
                const err = await res.json().catch(() => ({}));
                setError(err.error || "Failed to save recap");
            }
        } catch (e) {
            setError("Network error saving recap");
        }
        setSubmitting(false);
    };

    return (
        <div
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="card glass"
                style={{ width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", padding: "1.75rem", borderRadius: "1rem" }}
            >
                <h3 className="heading h4" style={{ marginBottom: "0.25rem" }}>Enter Recap</h3>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1.5rem" }}>
                    {row.workerName} · {row.storeName}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                        <label style={labelStyle}>Clock In</label>
                        <input type="datetime-local" className="input" value={clockIn} onChange={(e) => setClockIn(e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Clock Out</label>
                        <input type="datetime-local" className="input" value={clockOut} onChange={(e) => setClockOut(e.target.value)} />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                        <label style={labelStyle}>Break (minutes)</label>
                        <input type="number" min={0} className="input" value={breakTimeMinutes} onChange={(e) => setBreakTimeMinutes(e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Rush Level</label>
                        <select className="input" value={rushLevel} onChange={(e) => setRushLevel(e.target.value)}>
                            <option value="">— Not specified —</option>
                            <option value="Slow">Slow</option>
                            <option value="Medium">Medium</option>
                            <option value="Very Busy">Very Busy</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                        <label style={labelStyle}>Customers Sampled</label>
                        <input type="number" min={0} className="input" value={customersSampled} onChange={(e) => setCustomersSampled(e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Receipt Total ($)</label>
                        <input type="number" min={0} step="0.01" className="input" value={receiptTotal} onChange={(e) => setReceiptTotal(e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Reimbursement ($)</label>
                        <input type="number" min={0} step="0.01" className="input" value={reimbursementTotal} onChange={(e) => setReimbursementTotal(e.target.value)} />
                    </div>
                </div>

                <div style={fieldWrap}>
                    <label style={labelStyle}>Comments (optional)</label>
                    <textarea
                        className="input"
                        style={{ minHeight: "60px", resize: "vertical" }}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                    />
                </div>

                <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Bottles Sold</label>
                    <button
                        type="button"
                        onClick={addRow}
                        style={{ background: "none", border: "none", color: "#6366f1", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer" }}
                    >
                        + Add product
                    </button>
                </div>

                {skuRows.map((r, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
                        <select className="input" value={r.itemId} onChange={(e) => handlePickItem(idx, e.target.value)}>
                            <option value="">— Product —</option>
                            {inventoryItems.map((item: any) => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                        <input type="number" min={0} className="input" placeholder="Beg." title="Beginning inventory" value={r.beginning} onChange={(e) => updateRow(idx, { beginning: e.target.value })} />
                        <input type="number" min={0} className="input" placeholder="Purch." title="Purchased" value={r.purchased} onChange={(e) => updateRow(idx, { purchased: e.target.value })} />
                        <input type="number" min={0} className="input" placeholder="Sold" title="Bottles sold" value={r.sold} onChange={(e) => updateRow(idx, { sold: e.target.value })} />
                        <input type="number" min={0} step="0.01" className="input" placeholder="Price" title="Store price" value={r.storePrice} onChange={(e) => updateRow(idx, { storePrice: e.target.value })} />
                        <button
                            type="button"
                            onClick={() => removeRow(idx)}
                            title="Remove"
                            style={{ background: "none", border: "none", color: "#9ca3af", fontSize: "1.1rem", cursor: "pointer" }}
                        >
                            ×
                        </button>
                    </div>
                ))}

                {error && <div className="alert alert-danger" style={{ marginTop: "1rem", fontSize: "0.875rem" }}>{error}</div>}

                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                    <button onClick={onClose} style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", padding: "0.5rem 1rem", fontWeight: 600, cursor: "pointer" }}>
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary">
                        {submitting ? "Saving…" : "Save Recap"}
                    </button>
                </div>
            </div>
        </div>
    );
}
