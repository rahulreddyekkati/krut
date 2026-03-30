"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function PrintButton() {
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("print") === "true") {
            // Slight delay to ensure images/fonts load before printing
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [searchParams]);
    return (
        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
            <button
                onClick={() => window.print()}
                style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#6366f1",
                    color: "white",
                    fontWeight: 600,
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#4f46e5")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#6366f1")}
            >
                Print Report
            </button>
            <style jsx global>{`
                @media print {
                    button {
                        display: none !important;
                    }
                    body {
                        background-color: white !important;
                    }
                }
            `}</style>
        </div>
    );
}
