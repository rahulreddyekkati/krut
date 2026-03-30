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

    useEffect(() => {
        async function fetchRecap() {
            try {
                const res = await fetch(`/api/admin/recaps`);
                if (res.ok) {
                    const data = await res.json();
                    const found = data.recaps.find((r: any) => r.id === recapId);
                    if (found) {
                        setRecap(found);
                        setManagerReview(found.managerReview || "");
                    }
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
        try {
            const res = await fetch("/api/admin/recaps", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recapId, action, managerReview })
            });
            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                // Refresh
                setRecap((prev: any) => ({
                    ...prev,
                    status: action === "APPROVE" ? "APPROVED" : "REJECTED",
                    managerReview
                }));
            } else {
                alert("Failed to update recap");
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
        padding: "0.5rem 0",
        borderBottom: "1px solid #f3f4f6"
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
                    <span style={valueStyle}>{new Date(recap.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
            </div>

            {/* ── Sales Summary ── */}
            <div style={sectionStyle}>
                <h3 style={{ ...labelStyle, fontSize: "0.8rem", marginBottom: "0.75rem" }}>Sales Summary</h3>
                <div style={rowStyle}>
                    <span style={labelStyle}>Customers Sampled</span>
                    <span style={valueStyle}>{recap.consumersSampled || 0}</span>
                </div>
                <div style={rowStyle}>
                    <span style={labelStyle}>Receipt Total</span>
                    <span style={valueStyle}>${(recap.receiptTotal || 0).toFixed(2)}</span>
                </div>
                <div style={{ ...rowStyle, borderBottom: "none" }}>
                    <span style={labelStyle}>Reimbursement Total</span>
                    <span style={{ ...valueStyle, color: "#059669" }}>${(recap.reimbursement || 0).toFixed(2)}</span>
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
                    onClick={() => window.close()}
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
                )}
            </div>
        </div>
    );
}
