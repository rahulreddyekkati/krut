"use client";

import { useState, useEffect } from "react";
import styles from "./markets.module.css";

interface Market {
    id: string;
    name: string;
    _count: {
        stores: number;
        managers: number;
        jobs: number;
    };
}

export default function MarketsPage() {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMarketName, setNewMarketName] = useState("");
    const [editingMarket, setEditingMarket] = useState<Market | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchMarkets();
    }, []);

    const fetchMarkets = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/markets");
            if (res.ok) {
                const data = await res.json();
                setMarkets(data);
            }
        } catch (err) {
            setError("Failed to fetch markets");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            const res = await fetch("/api/markets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newMarketName }),
            });
            if (res.ok) {
                setNewMarketName("");
                setSuccess("Market created successfully");
                fetchMarkets();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to create market");
            }
        } catch (err) {
            setError("An error occurred");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMarket) return;
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`/api/markets/${editingMarket.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editingMarket.name }),
            });
            if (res.ok) {
                setEditingMarket(null);
                setSuccess("Market updated successfully");
                fetchMarkets();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to update market");
            }
        } catch (err) {
            setError("An error occurred");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this market?")) return;
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`/api/markets/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setSuccess("Market deleted successfully");
                fetchMarkets();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to delete market");
            }
        } catch (err) {
            setError("An error occurred");
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className="heading h2">Market Management</h1>
                <p className="text-secondary">Create and manage your regional markets</p>
            </header>

            {error && <div className="alert alert-danger animate-fade-in" style={{ marginBottom: "1rem" }}>{error}</div>}
            {success && <div className="alert alert-success animate-fade-in" style={{ marginBottom: "1rem" }}>{success}</div>}

            <section className={`${styles.createSection} glass card`}>
                <h2 className="heading h4">{editingMarket ? "Edit Market" : "Create New Market"}</h2>
                <form onSubmit={editingMarket ? handleUpdate : handleCreate} className={styles.form}>
                    <input
                        type="text"
                        placeholder="Market Name (e.g., North East, Florida)"
                        value={editingMarket ? editingMarket.name : newMarketName}
                        onChange={(e) => editingMarket
                            ? setEditingMarket({ ...editingMarket, name: e.target.value })
                            : setNewMarketName(e.target.value)
                        }
                        className="input"
                        required
                    />
                    <div className={styles.formActions}>
                        <button type="submit" className="btn btn-primary">
                            {editingMarket ? "Update Market" : "Create Market"}
                        </button>
                        {editingMarket && (
                            <button type="button" onClick={() => setEditingMarket(null)} className="btn btn-secondary">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section className={styles.listSection}>
                {loading ? (
                    <p>Loading markets...</p>
                ) : markets.length === 0 ? (
                    <div className="card text-center" style={{ padding: "3rem" }}>
                        <p className="text-secondary">No markets found. Create your first one above!</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {markets.map((market) => (
                            <div key={market.id} className="card glass animate-fade-in">
                                <div className={styles.marketInfo}>
                                    <h3 className="heading h4">{market.name}</h3>
                                    <div className={styles.stats}>
                                        <span><strong>{market._count.stores}</strong> Stores</span>
                                        <span><strong>{market._count.managers}</strong> Managers</span>
                                    </div>
                                </div>
                                <div className={styles.cardActions}>
                                    <button onClick={() => setEditingMarket(market)} className="btn btn-secondary btn-sm">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(market.id)} className="btn btn-danger btn-sm">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
