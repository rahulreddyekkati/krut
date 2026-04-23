"use client";

import React, { useState } from "react";

export default function PendingRecapsTable({ recaps }: { recaps: any[] }) {
    const [sentReminders, setSentReminders] = useState<Record<string, boolean>>({});
    const [sendingReminder, setSendingReminder] = useState<string | null>(null);

    const handleSendNotification = async (row: any) => {
        // Prevent double sending
        if (sentReminders[row.workerId]) return;

        setSendingReminder(row.workerId);
        try {
            const isOverdue = row.hoursOverdue !== undefined;
            const message = isOverdue
                ? `Please submit your recap for your shift at ${row.storeName}. You clocked out ${row.hoursOverdue} hours ago.`
                : `Reminder: You have not completed your recap. Please submit it as soon as possible.`;

            const res = await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipientId: row.workerId,
                    title: "Recap Reminder",
                    message,
                    type: "RECAP_REMINDER" // Keeps compatibility with existing dashboard logs
                })
            });

            if (res.ok) {
                setSentReminders((prev) => ({ ...prev, [row.workerId]: true }));
            } else {
                alert("Failed to send notification");
            }
        } catch (e) {
            alert("Network error sending notification");
        }
        setSendingReminder(null);
    };

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return "--";
        // format consistently with dashboard
        return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    if (!recaps || recaps.length === 0) {
        return <p style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>No records found.</p>;
    }

    const hasHoursOverdue = recaps[0]?.hoursOverdue !== undefined;

    const tableStyle: React.CSSProperties = {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "0.875rem"
    };

    const thStyle: React.CSSProperties = {
        textAlign: "left",
        padding: "0.75rem 1rem",
        borderBottom: "2px solid #e5e7eb",
        fontWeight: 700,
        color: "#374151",
        fontSize: "0.75rem",
        textTransform: "uppercase",
        letterSpacing: "0.03em"
    };

    const tdStyle: React.CSSProperties = {
        padding: "0.75rem 1rem",
        borderBottom: "1px solid #f3f4f6",
        color: "#111827"
    };

    return (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>Worker Name</th>
                        <th style={thStyle}>Store Name</th>
                        <th style={thStyle}>Market</th>
                        <th style={thStyle}>Clock In</th>
                        <th style={thStyle}>Clock Out</th>
                        {hasHoursOverdue && <th style={thStyle}>Hours Overdue</th>}
                        <th style={thStyle}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {recaps.map((row: any) => {
                        const isSent = sentReminders[row.workerId];
                        const isSending = sendingReminder === row.workerId;
                        
                        let overdueColor = "#6b7280"; // default gray
                        let isUrgent = false;
                        if (hasHoursOverdue) {
                            const hours = row.hoursOverdue;
                            const isCritical = hours > 48;
                            isUrgent = hours > 24 && !isCritical;
                            overdueColor = isCritical ? '#EF4444' : (isUrgent ? '#F59E0B' : '#6B7280');
                        }

                        // Use same assignment ID or worker ID as key if assignment ID isn't directly exposed
                        const rowKey = row.id || row.workerId;

                        return (
                            <tr key={rowKey}>
                                <td style={tdStyle}>{row.workerName}</td>
                                <td style={tdStyle}>{row.storeName}</td>
                                <td style={tdStyle}>{row.marketName || row.market}</td>
                                <td style={tdStyle}>{formatTime(row.clockIn)}</td>
                                <td style={tdStyle}>{formatTime(row.clockOut)}</td>
                                {hasHoursOverdue && (
                                    <td style={{ ...tdStyle, color: overdueColor, fontWeight: (overdueColor !== '#6b7280') ? 700 : 400 }}>
                                        {row.hoursOverdue}h overdue
                                    </td>
                                )}
                                <td style={tdStyle}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleSendNotification(row); }}
                                        disabled={isSent || isSending}
                                        style={{
                                            padding: "0.375rem 0.875rem",
                                            background: isSent ? "#9ca3af" : (isSending ? "#d1d5db" : "#ef4444"),
                                            color: "white",
                                            border: "none",
                                            borderRadius: "8px",
                                            fontSize: "0.75rem",
                                            fontWeight: 700,
                                            cursor: (isSent || isSending) ? "not-allowed" : "pointer",
                                            whiteSpace: "nowrap",
                                            transition: "all 0.2s"
                                        }}
                                    >
                                        {isSent ? "Sent ✓" : (isSending ? "Sending..." : "Send Notification")}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
