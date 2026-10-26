"use client";

import { useMemo, useState } from "react";
import { STORE_CHAINS, STORE_CHAIN_LABELS } from "@/lib/storeChain";

interface Market {
    id: string;
    name: string;
}

interface Store {
    id: string;
    name: string;
    marketId: string;
    chain?: string;
}

const BRAND_OPTIONS = [
    { value: "", label: "All Brands" },
    { value: "KRUTO", label: "Kruto" },
    { value: "MULUK", label: "Muluk" },
    { value: "BOTH", label: "Both" },
    { value: "UNALLOCATED", label: "Unallocated" },
];

const labelStyle = { display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" } as const;
const listStyle = {
    maxHeight: "150px", overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: "8px",
    padding: "0.375rem 0.5rem", background: "#fff",
} as const;
const checkRowStyle = { display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", padding: "0.2rem 0", cursor: "pointer" } as const;

// Checkbox list where nothing ticked means "all" — so the default export covers everything.
function MultiCheck({ label, allLabel, options, selected, onChange, emptyText }: {
    label: string;
    allLabel: string;
    options: { id: string; name: string }[];
    selected: string[];
    onChange: (ids: string[]) => void;
    emptyText: string;
}) {
    const toggle = (id: string) =>
        onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
    return (
        <div>
            <label style={labelStyle}>
                {label}{" "}
                <span style={{ fontWeight: 400, color: "#6b7280" }}>
                    ({selected.length === 0 ? allLabel : `${selected.length} selected`})
                </span>
            </label>
            <div style={listStyle}>
                <label style={{ ...checkRowStyle, fontWeight: 600 }}>
                    <input type="checkbox" checked={selected.length === 0} onChange={() => onChange([])} />
                    {allLabel}
                </label>
                {options.length === 0 && <div style={{ fontSize: "0.8125rem", color: "#9ca3af", padding: "0.2rem 0" }}>{emptyText}</div>}
                {options.map(o => (
                    <label key={o.id} style={checkRowStyle}>
                        <input type="checkbox" checked={selected.includes(o.id)} onChange={() => toggle(o.id)} />
                        {o.name}
                    </label>
                ))}
            </div>
        </div>
    );
}

export default function ExportShiftsModal({ markets, stores, onClose }: {
    markets: Market[];
    stores: Store[];
    onClose: () => void;
}) {
    const [chain, setChain] = useState("");
    const [marketIds, setMarketIds] = useState<string[]>([]);
    const [storeIds, setStoreIds] = useState<string[]>([]);
    const [brand, setBrand] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    const storeOptions = useMemo(
        () => stores.filter(s =>
            (!chain || s.chain === chain) &&
            (marketIds.length === 0 || marketIds.includes(s.marketId))
        ),
        [stores, chain, marketIds]
    );

    // Narrowing store type or markets drops any ticked store that no longer fits.
    const visibleStoreIds = new Set(storeOptions.map(s => s.id));
    const effectiveStoreIds = storeIds.filter(id => visibleStoreIds.has(id));

    const handleExport = async () => {
        setError("");
        setInfo("");
        if (!startDate || !endDate) {
            setError("Pick a from and to date.");
            return;
        }
        if (endDate < startDate) {
            setError("The to date must be on or after the from date.");
            return;
        }
        setExporting(true);
        try {
            const res = await fetch("/api/admin/jobs/export", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startDate,
                    endDate,
                    chains: chain ? [chain] : [],
                    marketIds,
                    storeIds: effectiveStoreIds,
                    brands: brand ? [brand] : [],
                }),
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                setError(d.error || "Export failed");
                return;
            }
            if (res.headers.get("X-Row-Count") === "0") {
                setInfo("No shifts match these filters.");
                return;
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Shifts_${startDate}_to_${endDate}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            onClose();
        } catch {
            setError("Network error");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
        >
            <div
                onClick={e => e.stopPropagation()}
                className="card glass"
                style={{ width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", padding: "1.75rem", borderRadius: "1rem" }}
            >
                <h3 className="heading h4" style={{ marginBottom: "0.25rem" }}>Export Shifts</h3>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1.5rem" }}>
                    Download a CSV of every shift matching these filters.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.25rem" }}>
                    <div>
                        <label style={labelStyle}>Store Type</label>
                        <select className="input" value={chain} onChange={e => setChain(e.target.value)}>
                            <option value="">All Store Types</option>
                            {STORE_CHAINS.map(c => (
                                <option key={c} value={c}>{STORE_CHAIN_LABELS[c]}</option>
                            ))}
                        </select>
                    </div>

                    <MultiCheck
                        label="Markets"
                        allLabel="All Markets"
                        options={markets}
                        selected={marketIds}
                        onChange={setMarketIds}
                        emptyText="No markets"
                    />

                    <MultiCheck
                        label="Stores"
                        allLabel="All Stores"
                        options={storeOptions}
                        selected={effectiveStoreIds}
                        onChange={setStoreIds}
                        emptyText="No stores match this store type and market"
                    />

                    <div>
                        <label style={labelStyle}>Brand</label>
                        <select className="input" value={brand} onChange={e => setBrand(e.target.value)}>
                            {BRAND_OPTIONS.map(b => (
                                <option key={b.value} value={b.value}>{b.label}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={labelStyle}>From</label>
                            <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>To</label>
                            <input type="date" className="input" value={endDate} min={startDate || undefined} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>
                </div>

                {error && <div className="alert alert-danger" style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>{error}</div>}
                {info && <div style={{ marginBottom: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>{info}</div>}

                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                    <button onClick={onClose} className="btn" style={{ background: "#f3f4f6", color: "#374151" }}>Cancel</button>
                    <button onClick={handleExport} disabled={exporting || !startDate || !endDate} className="btn btn-primary">
                        {exporting ? "Exporting…" : "Export"}
                    </button>
                </div>
            </div>
        </div>
    );
}
