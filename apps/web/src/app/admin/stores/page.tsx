"use client";

import { useState, useEffect } from "react";
import styles from "./stores.module.css";
import Papa from "papaparse";

interface Store {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius: number;
    marketId: string;
    market: { name: string };
    _count: { jobs: number };
}

interface Market {
    id: string;
    name: string;
}

export default function StoresPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [markets, setMarkets] = useState<Market[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // UI State
    const [showForm, setShowForm] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);
    const [formData, setFormData] = useState({
        name: "", address: "", latitude: "", longitude: "", radius: "100", marketId: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [storesRes, marketsRes] = await Promise.all([
                fetch("/api/stores"),
                fetch("/api/markets")
            ]);
            if (storesRes.ok && marketsRes.ok) {
                setStores(await storesRes.json());
                setMarkets(await marketsRes.json());
            }
        } catch (err) {
            setError("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        const method = editingStore ? "PUT" : "POST";
        const url = editingStore ? `/api/stores/${editingStore.id}` : "/api/stores";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setSuccess(`Store ${editingStore ? "updated" : "created"} successfully`);
                resetForm();
                fetchData();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to save store");
            }
        } catch (err) {
            setError("An error occurred");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/stores/${id}`, { method: "DELETE" });
            if (res.ok) {
                setSuccess("Store deleted");
                fetchData();
            } else {
                const data = await res.json();
                setError(data.error);
            }
        } catch (err) {
            setError("Failed to delete");
        }
    };

    const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const rows = results.data.map((row: any) => ({
                    name: row.Name || row.name,
                    address: row.Address || row.address,
                    latitude: parseFloat(row.Latitude || row.latitude || 0),
                    longitude: parseFloat(row.Longitude || row.longitude || 0),
                    marketName: row.Market || row.market || "General"
                }));

                try {
                    const res = await fetch("/api/stores/import", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ rows }),
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setSuccess(`Import complete: ${data.success} succeeded, ${data.failed} failed.`);
                        fetchData();
                        setShowImport(false);
                    }
                } catch (err) {
                    setError("Bulk import failed");
                }
            }
        });
    };

    const resetForm = () => {
        setFormData({ name: "", address: "", latitude: "", longitude: "", radius: "100", marketId: "" });
        setEditingStore(null);
        setShowForm(false);
    };

    const startEdit = (store: Store) => {
        setEditingStore(store);
        setFormData({
            name: store.name,
            address: store.address,
            latitude: store.latitude.toString(),
            longitude: store.longitude.toString(),
            radius: store.radius.toString(),
            marketId: store.marketId
        });
        setShowForm(true);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.actions}>
                    <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary">Add Store</button>
                    <button onClick={() => setShowImport(!showImport)} className="btn btn-secondary">Bulk Import (CSV)</button>
                </div>
                <h1 className="heading h2">Store Management</h1>
            </header>

            {showImport && (
                <div className="card glass animate-fade-in" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
                    <h3 className="heading h4">Upload Store CSV</h3>
                    <p className="text-secondary" style={{ fontSize: "0.875rem" }}>Required columns: Name, Address, Latitude, Longitude, Market</p>
                    <input type="file" accept=".csv" onChange={handleCsvUpload} className={styles.fileInput} />
                </div>
            )}

            {showForm && (
                <div className="card glass animate-fade-in" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
                    <h3 className="heading h4">{editingStore ? "Edit" : "New"} Store</h3>
                    <form onSubmit={handleSubmit} className={styles.formGrid}>
                        <input type="text" placeholder="Store Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input" required />
                        <input type="text" placeholder="Full Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="input" required />
                        <div className={styles.row}>
                            <input type="number" step="any" placeholder="Latitude" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} className="input" required />
                            <input type="number" step="any" placeholder="Longitude" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} className="input" required />
                        </div>
                        <div className={styles.row}>
                            <select value={formData.marketId} onChange={e => setFormData({ ...formData, marketId: e.target.value })} className="input" required>
                                <option value="">Select Market</option>
                                {markets.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                            <input type="number" placeholder="Radius (meters)" value={formData.radius} onChange={e => setFormData({ ...formData, radius: e.target.value })} className="input" required />
                        </div>
                        <div className={styles.formActions}>
                            <button type="submit" className="btn btn-primary">Save Store</button>
                            <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Market</th>
                            <th>Address</th>
                            <th>Location</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(loading ? [] : stores).map(store => (
                            <tr key={store.id} className="animate-fade-in">
                                <td><strong>{store.name}</strong></td>
                                <td><span className="badge">{store.market.name}</span></td>
                                <td className={styles.addressCell}>{store.address}</td>
                                <td className={styles.coordCell}>{store.latitude.toFixed(4)}, {store.longitude.toFixed(4)}</td>
                                <td className={styles.actionsCell}>
                                    <button onClick={() => startEdit(store)} className="btn btn-secondary btn-sm">Edit</button>
                                    <button onClick={() => handleDelete(store.id)} className="btn btn-danger btn-sm">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {stores.length === 0 && !loading && (
                    <div className="text-center" style={{ padding: "3rem" }}>No stores found.</div>
                )}
            </div>
        </div>
    );
}
