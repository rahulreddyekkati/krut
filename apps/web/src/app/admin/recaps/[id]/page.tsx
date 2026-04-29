"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function RecapDetailPage() {
    const params = useParams();
    const router = useRouter();
    const recapId = params.id as string;
    const [recap, setRecap] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [managerReview, setManagerReview] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [consumersSampled, setConsumersSampled] = useState<number>(0);
    const [receiptTotal, setReceiptTotal] = useState<number>(0);
    const [reimbursement, setReimbursement] = useState<number>(0);
    const [rushLevel, setRushLevel] = useState<string>("");

    useEffect(() => {
        async function fetchRecap() {
            try {
                // Fetch directly from the detail endpoint
                const res = await fetch(`/api/admin/recaps/${recapId}`);
                if (res.ok) {
                    const data = await res.json();
                    setRecap(data);
                    setManagerReview(data.managerReview || "");
                    setConsumersSampled(data.consumersSampled || 0);
                    setReceiptTotal(data.receiptTotal || 0);
                    setReimbursement(data.reimbursement || 0);
                    setRushLevel(data.rushLevel || "");
                }
            } catch (e) {
                console.error("Failed to fetch recap", e);
            }
            setLoading(false);
        }
        fetchRecap();
    }, [recapId]);

    const handleAction = async (action: "APPROVE" | "REJECT") => {
        setSubmitting(true);
        const endpoint = action === "APPROVE" 
            ? `/api/admin/recaps/${recapId}/approve` 
            : `/api/admin/recaps/${recapId}/reject`;

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    recapId, 
                    managerNotes: managerReview,
                    // Only send edits on approval
                    ...(action === "APPROVE" ? {
                        consumersSampled,
                        rushLevel,
                        receiptTotal,
                        reimbursement
                    } : {})
                })
            });
            
            if (res.ok) {
                const data = await res.json();
                alert(data.message || `Successfully ${action.toLowerCase()}d`);
                // Refresh local state
                setRecap((prev: any) => ({
                    ...prev,
                    status: action === "APPROVE" ? "APPROVED" : "REJECTED",
                    managerReview
                }));
            } else {
                const err = await res.json();
                alert(err.error || "Failed to update recap");
            }
        } catch (e) {
            alert("Error updating recap");
        }
        setSubmitting(false);
    };

    const formatTime = (date: string | null) => {
        if (!date) return "--";
        return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const sectionStyle: React.CSSProperties = {
        marginBottom: "1.5rem",
        padding: "1.25rem",
        background: "#f9fafb",
        borderRadius: "12px",
        border: "1px solid #f3f4f6"
    };

    const labelStyle: React.CSSProperties = {
        fontSize: "0.7rem",
        fontWeight: 700,
        textTransform: "uppercase",
        color: "#6b7280",
        letterSpacing: "0.05em",
        marginBottom: "0.25rem"
    };

    const valueStyle: React.CSSProperties = {
        fontSize: "0.95rem",
        fontWeight: 600,
        color: "#111827"
    };

    const rowStyle: React.CSSProperties = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.5rem 0",
        borderBottom: "1px solid #f3f4f6"
    };

    const inputStyle: React.CSSProperties = {
        padding: "0.4rem 0.75rem",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        fontSize: "0.9rem",
        fontWeight: 600,
        textAlign: "right",
        width: "120px",
        background: "white",
        outline: "none"
    };

    if (loading) {
        return (
            <div style={{ padding: "3rem", textAlign: "center", color: "#9ca3af" }}>
                Loading recap...
            </div>
        );
    }

    if (!recap) {
        return (
            <div style={{ padding: "3rem", textAlign: "center", color: "#9ca3af" }}>
                Recap not found.
                <br />
                <button onClick={() => router.back()} style={{ marginTop: "1rem", padding: "0.5rem 1.5rem", background: "#6366f1", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                    Back
                </button>
            </div>
        );
    }

    const statusColors: any = {
        PENDING: { bg: "#fef3c7", color: "#92400e" },
        APPROVED: { bg: "#d1fae5", color: "#065f46" },
        REJECTED: { bg: "#fce4ec", color: "#b71c1c" }
    };
    const sc = statusColors[recap.status] || statusColors.PENDING;

    return (
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "2rem 1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h1 className="heading h2">Recap Details</h1>
                <span style={{
                    padding: "0.3rem 1rem",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    background: sc.bg,
                    color: sc.color,
                    textTransform: "uppercase"
                }}>
                    {recap.status}
                </span>
            </div>

            {/* ── Shift Info ── */}
            <div style={sectionStyle}>
                <h3 style={{ ...labelStyle, fontSize: "0.8rem", marginBottom: "0.75rem" }}>Shift Information</h3>
                <div style={rowStyle}>
                    <span style={labelStyle}>Worker</span>
                    <span style={valueStyle}>{recap.workerName}</span>
                </div>
                <div style={rowStyle}>
                    <span style={labelStyle}>Store</span>
                    <span style={valueStyle}>{recap.storeName}</span>
                </div>
                <div style={rowStyle}>
                    <span style={labelStyle}>Market</span>
                    <span style={valueStyle}>{recap.marketName}</span>
                </div>
                <div style={rowStyle}>
                    <span style={labelStyle}>Date</span>
                    <span style={valueStyle}>{recap.shiftDate ? new Date(recap.shiftDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : "--"}</span>
                </div>
                <div style={rowStyle}>
                    <span style={labelStyle}>Clock In</span>
                    <span style={valueStyle}>{formatTime(recap.clockIn)}</span>
                </div>
                <div style={{ ...rowStyle, borderBottom: "none" }}>
                    <span style={labelStyle}>Clock Out</span>
                    <span style={valueStyle}>{formatTime(recap.clockOut)}</span>
                </div>
            </div>

            {/* ── Rush Level ── */}
            <div style={sectionStyle}>
                <h3 style={{ ...labelStyle, fontSize: "0.8rem", marginBottom: "0.5rem" }}>Rush Level</h3>
                {recap.status === "PENDING" ? (
                    <select
                        value={rushLevel}
                        onChange={(e) => setRushLevel(e.target.value)}
                        style={{ ...inputStyle, width: "100%", textAlign: "left" }}
                    >
                        <option value="Slow">Slow</option>
                        <option value="Medium">Medium</option>
                        <option value="Very Busy">Very Busy</option>
                    </select>
                ) : (
                    <span style={{
                        padding: "0.3rem 1rem",
                        borderRadius: "8px",
                        background: recap.rushLevel === "Very Busy" ? "#fce4ec" : recap.rushLevel === "Medium" ? "#fff3e0" : "#e8f5e9",
                        color: recap.rushLevel === "Very Busy" ? "#b71c1c" : recap.rushLevel === "Medium" ? "#e65100" : "#1b5e20",
                        fontWeight: 600,
                        fontSize: "0.85rem"
                    }}>
                        {recap.rushLevel || "Not specified"}
                    </span>
                )}
            </div>

            {/* ── Sales Summary ── */}
            <div style={sectionStyle}>
                <h3 style={{ ...labelStyle, fontSize: "0.8rem", marginBottom: "0.75rem" }}>Sales Summary</h3>
                <div style={rowStyle}>
                    <span style={labelStyle}>Customers Sampled</span>
                    {recap.status === "PENDING" ? (
                        <input
                            type="number"
                            value={consumersSampled}
                            onChange={(e) => setConsumersSampled(parseInt(e.target.value) || 0)}
                            style={inputStyle}
                        />
                    ) : (
                        <span style={valueStyle}>{recap.consumersSampled || 0}</span>
                    )}
                </div>
                <div style={rowStyle}>
                    <span style={labelStyle}>Receipt Total ($)</span>
                    {recap.status === "PENDING" ? (
                        <input
                            type="number"
                            step="0.01"
                            value={receiptTotal}
                            onChange={(e) => setReceiptTotal(parseFloat(e.target.value) || 0)}
                            style={inputStyle}
                        />
                    ) : (
                        <span style={valueStyle}>${(recap.receiptTotal || 0).toFixed(2)}</span>
                    )}
                </div>
                <div style={{ ...rowStyle, borderBottom: "none" }}>
                    <span style={labelStyle}>Reimbursement ($)</span>
                    {recap.status === "PENDING" ? (
                        <input
                            type="number"
                            step="0.01"
                            value={reimbursement}
                            onChange={(e) => setReimbursement(parseFloat(e.target.value) || 0)}
                            style={{ ...inputStyle, color: "#059669" }}
                        />
                    ) : (
                        <span style={{ ...valueStyle, color: "#059669" }}>${(recap.reimbursement || 0).toFixed(2)}</span>
                    )}
                </div>
            </div>

            {/* ── Inventory / SKUs ── */}
            {recap.skus && recap.skus.length > 0 && (
                <div style={sectionStyle}>
                    <h3 style={{ ...labelStyle, fontSize: "0.8rem", marginBottom: "0.75rem" }}>Inventory Tracking</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #e5e7eb", ...labelStyle }}>SKU Name</th>
                                <th style={{ textAlign: "center", padding: "0.5rem", borderBottom: "1px solid #e5e7eb", ...labelStyle }}>Beg. Inv</th>
                                <th style={{ textAlign: "center", padding: "0.5rem", borderBottom: "1px solid #e5e7eb", ...labelStyle }}>Purchased</th>
                                <th style={{ textAlign: "center", padding: "0.5rem", borderBottom: "1px solid #e5e7eb", ...labelStyle }}>Sold</th>
                                <th style={{ textAlign: "right", padding: "0.5rem", borderBottom: "1px solid #e5e7eb", ...labelStyle }}>Store Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recap.skus.map((sku: any) => (
                                <tr key={sku.id}>
                                    <td style={{ padding: "0.5rem", borderBottom: "1px solid #f3f4f6" }}>{sku.skuName}</td>
                                    <td style={{ padding: "0.5rem", borderBottom: "1px solid #f3f4f6", textAlign: "center" }}>{sku.beginningInventory || 0}</td>
                                    <td style={{ padding: "0.5rem", borderBottom: "1px solid #f3f4f6", textAlign: "center" }}>{sku.purchased || 0}</td>
                                    <td style={{ padding: "0.5rem", borderBottom: "1px solid #f3f4f6", textAlign: "center", fontWeight: 700, color: '#4f46e5' }}>{sku.bottlesSold || 0}</td>
                                    <td style={{ padding: "0.5rem", borderBottom: "1px solid #f3f4f6", textAlign: "right" }}>${(sku.storePrice || 0).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Receipt URL ── */}
            {recap.receiptUrl && (
                <div style={sectionStyle}>
                    <h3 style={{ ...labelStyle, fontSize: "0.8rem", marginBottom: "0.5rem" }}>Receipt{(recap.receiptUrl.startsWith('[') && recap.receiptUrl.endsWith(']')) ? 's' : ''}</h3>
                    {(() => {
                        let urls = [recap.receiptUrl];
                        try {
                            if (recap.receiptUrl.startsWith('[') && recap.receiptUrl.endsWith(']')) {
                                urls = JSON.parse(recap.receiptUrl);
                            }
                        } catch(e) {}
                        
                        return (
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {urls.map((url: string, idx: number) => (
                                    <div key={idx} style={{ maxWidth: "100%" }}>
                                        {url.startsWith('data:image') || url.match(/\.(jpeg|jpg|gif|png)$/i) != null ? (
                                            <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                                                <img src={url} alt={`Receipt ${idx + 1}`} style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "8px", border: "1px solid #e5e7eb", objectFit: "contain" }} />
                                            </a>
                                        ) : (
                                            <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1", fontWeight: 600, wordBreak: "break-all", display: 'inline-block' }}>
                                                {url}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* ── Customer Feedback ── */}
            {recap.customerFeedback && (
                <div style={sectionStyle}>
                    <h3 style={{ ...labelStyle, fontSize: "0.8rem", marginBottom: "0.5rem" }}>Customer Feedback</h3>
                    <p style={{ color: "#374151", fontSize: "0.9rem", lineHeight: "1.5" }}>{recap.customerFeedback}</p>
                </div>
            )}

            {/* ── Fraud / Quality Flags ── */}
            {(() => {
                const flags: { label: string; level: "warn" | "danger" }[] = [];
                const hasReceipt = recap.receiptUrl && recap.receiptUrl !== "[]" && recap.receiptUrl !== "null" && recap.receiptUrl !== "";
                const hasSig = !!recap.managerSignature;
                const reimb = recap.reimbursement ?? 0;
                const sales = recap.receiptTotal ?? 0;

                if (!hasReceipt) flags.push({ label: "No receipt photo uploaded", level: "warn" });
                if (!hasSig) flags.push({ label: recap.storeManagerName ? `Manager "${recap.storeManagerName}" did not sign` : "Store manager sign-off missing", level: "warn" });
                if (reimb > 0 && sales === 0) flags.push({ label: `Claims $${reimb.toFixed(2)} reimbursement with $0.00 in sales`, level: "danger" });
                if (reimb > sales && sales > 0) flags.push({ label: `Reimbursement ($${reimb.toFixed(2)}) exceeds sales ($${sales.toFixed(2)})`, level: "warn" });

                (recap.skus ?? []).forEach((sku: any) => {
                    const max = (sku.beginningInventory ?? 0) + (sku.purchased ?? 0);
                    if (sku.bottlesSold > max) {
                        flags.push({ label: `${sku.skuName}: sold ${sku.bottlesSold} but only had ${max} in stock — impossible`, level: "danger" });
                    }
                });

                if (flags.length === 0) return (
                    <div style={{ ...sectionStyle, background: "#f0fdf4", border: "1px solid #bbf7d0", marginBottom: "1rem" }}>
                        <span style={{ color: "#15803d", fontWeight: 700, fontSize: "0.85rem" }}>✓ No fraud or quality flags detected</span>
                    </div>
                );

                return (
                    <div style={{ ...sectionStyle, background: "#fff7ed", border: "2px solid #fed7aa", marginBottom: "1rem" }}>
                        <h3 style={{ ...labelStyle, fontSize: "0.8rem", color: "#c2410c", marginBottom: "0.75rem" }}>⚠ Flags ({flags.length})</h3>
                        {flags.map((f, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", gap: "0.5rem",
                                padding: "0.4rem 0",
                                borderBottom: i < flags.length - 1 ? "1px solid #fed7aa" : "none",
                                fontSize: "0.875rem",
                                color: f.level === "danger" ? "#b91c1c" : "#92400e",
                                fontWeight: f.level === "danger" ? 700 : 500
                            }}>
                                <span>{f.level === "danger" ? "🔴" : "🟡"}</span>
                                <span>{f.label}</span>
                            </div>
                        ))}
                    </div>
                );
            })()}

            {/* ── Manager Review ── */}
            <div style={{
                ...sectionStyle,
                background: "#eef2ff",
                border: "2px solid #c7d2fe"
            }}>
                <h3 style={{ ...labelStyle, fontSize: "0.8rem", marginBottom: "0.75rem", color: "#4338ca" }}>Manager&apos;s Review</h3>
                <textarea
                    value={managerReview}
                    onChange={(e) => setManagerReview(e.target.value)}
                    placeholder="Write your review comments here..."
                    disabled={recap.status === "APPROVED" || recap.status === "REJECTED"}
                    style={{
                        width: "100%",
                        minHeight: "100px",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #c7d2fe",
                        fontSize: "0.875rem",
                        fontFamily: "inherit",
                        resize: "vertical",
                        outline: "none",
                        background: recap.status !== "PENDING" ? "#f3f4f6" : "white"
                    }}
                />
            </div>

            {/* ── Action Buttons ── */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button
                    onClick={() => router.back()}
                    style={{
                        padding: "0.625rem 1.5rem",
                        background: "#f3f4f6",
                        color: "#374151",
                        border: "1px solid #d1d5db",
                        borderRadius: "10px",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        cursor: "pointer"
                    }}
                >
                    Back
                </button>
                {recap.status === "PENDING" && (
                    <>
                        <button
                            onClick={() => handleAction("REJECT")}
                            disabled={submitting}
                            style={{
                                padding: "0.625rem 1.5rem",
                                background: "white",
                                color: "#b71c1c",
                                border: "1px solid #ef5350",
                                borderRadius: "10px",
                                fontSize: "0.875rem",
                                fontWeight: 700,
                                cursor: submitting ? "not-allowed" : "pointer"
                            }}
                        >
                            Reject
                        </button>
                        <button
                            onClick={() => handleAction("APPROVE")}
                            disabled={submitting}
                            style={{
                                padding: "0.625rem 2rem",
                                background: submitting ? "#9ca3af" : "#10b981",
                                color: "white",
                                border: "none",
                                borderRadius: "10px",
                                fontSize: "0.875rem",
                                fontWeight: 700,
                                cursor: submitting ? "not-allowed" : "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            {submitting ? "Approving..." : "Approve"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
