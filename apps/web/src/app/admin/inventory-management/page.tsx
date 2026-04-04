"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../admin.module.css";

export default function InventoryManagementPage() {
    const pathname = usePathname();

    return (
        <div className={styles.container}>
            <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="heading h2">Inventory</h1>
                    <p className="text-secondary">Track and manage store supplies and equipment.</p>
                </div>
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

            <div className="card glass animate-fade-in" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                </div>
                <h2 className="heading h3">Inventory Management System</h2>
                <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0.5rem auto 0 auto' }}>
                    This section will allow you to manage inventory distribution, track usage, and monitor stock levels across all locations.
                </p>
            </div>
        </div>
    );
}
