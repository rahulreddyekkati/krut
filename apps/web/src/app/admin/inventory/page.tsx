"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../admin.module.css";
import invStyles from "./inventory.module.css";

export default function AdminInventoryPage() {
    const pathname = usePathname();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    const [newItem, setNewItem] = useState({
        name: "",
        color: "",
        size: "",
        unit: "ml"
    });

    // Load from API
    const fetchItems = async () => {
        try {
            const res = await fetch("/api/inventory");
            if (res.ok) {
                setInventoryItems(await res.json());
            }
        } catch (e) {
            console.error("Failed to fetch inventory items", e);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name || !newItem.size) {
            alert("Please provide at least a name and size.");
            return;
        }

        try {
            const res = await fetch("/api/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newItem.name,
                    category: newItem.color,
                    volume: newItem.size,
                    unit: newItem.unit
                })
            });

            if (res.ok) {
                fetchItems();
                setIsModalOpen(false);
                setNewItem({ name: "", color: "", size: "", unit: "ml" });
            } else {
                const err = await res.json();
                alert(err.error || "Failed to add item");
            }
        } catch (e) {
            alert("Network error");
        }
    };

    const removeItem = async (id: string) => {
        if (!confirm("Are you sure you want to remove this item?")) return;
        try {
            const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchItems();
            } else {
                alert("Failed to remove item");
            }
        } catch (e) {
            alert("Network error");
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="heading h2">Inventory</h1>
                    <p className="text-secondary">Track and manage store supplies and equipment.</p>
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={() => setIsModalOpen(true)}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add New
                </button>
            </header>

            <div style={{ 
                display: 'flex', 
                gap: '2rem', 
                marginBottom: '2rem', 
                borderBottom: '1px solid var(--card-border)',
                padding: '0 0.5rem'
            }}>
                <Link 
                    href="/admin/inventory" 
                    style={{ 
                        padding: '1rem 0', 
                        fontSize: '0.9375rem', 
                        fontWeight: 600,
                        color: pathname === '/admin/inventory' ? 'var(--primary)' : 'var(--secondary)',
                        borderBottom: pathname === '/admin/inventory' ? '2px solid var(--primary)' : '2px solid transparent',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    </svg>
                    Inventory Items
                </Link>
                <Link 
                    href="/admin/store-inventory" 
                    style={{ 
                        padding: '1rem 0', 
                        fontSize: '0.9375rem', 
                        fontWeight: 600,
                        color: pathname === '/admin/store-inventory' ? 'var(--primary)' : 'var(--secondary)',
                        borderBottom: pathname === '/admin/store-inventory' ? '2px solid var(--primary)' : '2px solid transparent',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                    Store Inventory
                </Link>
                <Link 
                    href="/admin/inventory-management" 
                    style={{ 
                        padding: '1rem 0', 
                        fontSize: '0.9375rem', 
                        fontWeight: 600,
                        color: pathname === '/admin/inventory-management' ? 'var(--primary)' : 'var(--secondary)',
                        borderBottom: pathname === '/admin/inventory-management' ? '2px solid var(--primary)' : '2px solid transparent',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    Inventory Management
                </Link>

            </div>

            {inventoryItems.length === 0 ? (
                <div className="card glass animate-fade-in" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                    </div>
                    <h2 className="heading h3">No Inventory Items Yet</h2>
                    <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0.5rem auto 0 auto' }}>
                        Your inventory is currently empty. Start by adding items like supplies, equipment, or products.
                    </p>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary"
                        style={{ marginTop: '2rem' }}
                    >
                        Add Your First Item
                    </button>
                </div>
            ) : (
                <div className={invStyles.tableWrapper}>
                    <table className={invStyles.table}>
                        <thead>
                            <tr>
                                <th>Item Details</th>
                                <th>Volume/Size</th>
                                <th>Unit</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryItems.map(item => (
                                <tr key={item.id} className="animate-fade-in">
                                    <td>
                                        <div className={invStyles.itemInfo}>
                                            <span className={invStyles.itemName}>{item.name}</span>
                                            {item.category && <span className={invStyles.itemColor}>{item.category}</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <strong>{item.volume}</strong>
                                    </td>
                                    <td>
                                        <span className="badge" style={{ textTransform: 'none' }}>{item.unit}</span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button 
                                            onClick={() => removeItem(item.id)}
                                            className={invStyles.deleteBtn}
                                            title="Remove Item"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add New Modal */}
            {isModalOpen && (
                <div className={invStyles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={invStyles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={invStyles.modalHeader}>
                            <h3 className="heading h3">Add New Item</h3>
                            <button 
                                className="btn btn-ghost" 
                                onClick={() => setIsModalOpen(false)}
                                style={{ padding: '4px' }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddItem}>
                            <div className={invStyles.modalBody}>
                                <div className={invStyles.formGroup}>
                                    <label className={invStyles.inputLabel}>Item Name</label>
                                    <input 
                                        className="input" 
                                        placeholder="Enter item name"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                        required
                                    />
                                </div>
                                
                                <div className={invStyles.formGroup}>
                                    <label className={invStyles.inputLabel}>Category</label>
                                    <input
                                        className="input"
                                        placeholder="Enter category"
                                        value={newItem.color}
                                        onChange={(e) => setNewItem({...newItem, color: e.target.value})}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className={invStyles.formGroup}>
                                        <label className={invStyles.inputLabel}>Size (Number)</label>
                                        <input 
                                            type="number"
                                            className="input" 
                                            placeholder="0"
                                            value={newItem.size}
                                            onChange={(e) => setNewItem({...newItem, size: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className={invStyles.formGroup}>
                                        <label className={invStyles.inputLabel}>Unit</label>
                                        <div className={invStyles.toggleGroup}>
                                            <label className={invStyles.checkboxLabel}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={newItem.unit === "ml"}
                                                    onChange={() => setNewItem({...newItem, unit: "ml"})}
                                                />
                                                ML
                                            </label>
                                            <label className={invStyles.checkboxLabel}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={newItem.unit === "L"}
                                                    onChange={() => setNewItem({...newItem, unit: "L"})}
                                                />
                                                L
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={invStyles.modalFooter}>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
