module.exports = [
"[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PendingRecapsTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function PendingRecapsTable({ recaps }) {
    const [sentReminders, setSentReminders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [sendingReminder, setSendingReminder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleSendNotification = async (row)=>{
        // Prevent double sending
        if (sentReminders[row.workerId]) return;
        setSendingReminder(row.workerId);
        try {
            const isOverdue = row.hoursOverdue !== undefined;
            const message = isOverdue ? `Please submit your recap for your shift at ${row.storeName}. You clocked out ${row.hoursOverdue} hours ago.` : `Reminder: You have not completed your recap. Please submit it as soon as possible.`;
            const res = await fetch("/api/notifications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    recipientId: row.workerId,
                    title: "Recap Reminder",
                    message,
                    type: "RECAP_REMINDER" // Keeps compatibility with existing dashboard logs
                })
            });
            if (res.ok) {
                setSentReminders((prev)=>({
                        ...prev,
                        [row.workerId]: true
                    }));
            } else {
                alert("Failed to send notification");
            }
        } catch (e) {
            alert("Network error sending notification");
        }
        setSendingReminder(null);
    };
    const formatTime = (dateStr)=>{
        if (!dateStr) return "--";
        // format consistently with dashboard
        return new Date(dateStr).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    };
    if (!recaps || recaps.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            style: {
                padding: "2rem",
                textAlign: "center",
                color: "#9ca3af"
            },
            children: "No records found."
        }, void 0, false, {
            fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
            lineNumber: 49,
            columnNumber: 16
        }, this);
    }
    const hasHoursOverdue = recaps[0]?.hoursOverdue !== undefined;
    const tableStyle = {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "0.875rem"
    };
    const thStyle = {
        textAlign: "left",
        padding: "0.75rem 1rem",
        borderBottom: "2px solid #e5e7eb",
        fontWeight: 700,
        color: "#374151",
        fontSize: "0.75rem",
        textTransform: "uppercase",
        letterSpacing: "0.03em"
    };
    const tdStyle = {
        padding: "0.75rem 1rem",
        borderBottom: "1px solid #f3f4f6",
        color: "#111827"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            overflowX: "auto",
            WebkitOverflowScrolling: "touch"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            style: tableStyle,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                style: thStyle,
                                children: "Worker Name"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                                lineNumber: 82,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                style: thStyle,
                                children: "Store Name"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                                lineNumber: 83,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                style: thStyle,
                                children: "Market"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                                lineNumber: 84,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                style: thStyle,
                                children: "Shift Date"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                                lineNumber: 85,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                style: thStyle,
                                children: "Clock In"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                                lineNumber: 86,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                style: thStyle,
                                children: "Clock Out"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                                lineNumber: 87,
                                columnNumber: 25
                            }, this),
                            hasHoursOverdue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                style: thStyle,
                                children: "Hours Overdue"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                                lineNumber: 88,
                                columnNumber: 45
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                style: thStyle,
                                children: "Action"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                                lineNumber: 89,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                        lineNumber: 81,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                    lineNumber: 80,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    children: recaps.map((row)=>{
                        const isSent = sentReminders[row.workerId];
                        const isSending = sendingReminder === row.workerId;
                        let overdueColor = "#6b7280"; // default gray
                        let isUrgent = false;
                        if (hasHoursOverdue) {
                            const hours = row.hoursOverdue;
                            const isCritical = hours > 48;
                            isUrgent = hours > 24 && !isCritical;
                            overdueColor = isCritical ? '#EF4444' : isUrgent ? '#F59E0B' : '#6B7280';
                        }
                        // Use same assignment ID or worker ID as key if assignment ID isn't directly exposed
                        const rowKey = row.id || row.workerId;
                        const shiftDateStr = row.shiftDate ? new Date(row.shiftDate).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                        }) : '—';
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    style: tdStyle,
                                    children: row.workerName
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                                    lineNumber: 112,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    style: tdStyle,
                                    children: row.storeName
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                                    lineNumber: 113,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    style: tdStyle,
                                    children: row.marketName || row.market
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                                    lineNumber: 114,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    style: tdStyle,
                                    children: shiftDateStr
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                                    lineNumber: 115,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    style: tdStyle,
                                    children: formatTime(row.clockIn)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                                    lineNumber: 116,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    style: tdStyle,
                                    children: formatTime(row.clockOut)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                                    lineNumber: 117,
                                    columnNumber: 33
                                }, this),
                                hasHoursOverdue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    style: {
                                        ...tdStyle,
                                        color: overdueColor,
                                        fontWeight: overdueColor !== '#6b7280' ? 700 : 400
                                    },
                                    children: [
                                        row.hoursOverdue,
                                        "h overdue"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                                    lineNumber: 119,
                                    columnNumber: 37
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    style: tdStyle,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: (e)=>{
                                            e.stopPropagation();
                                            handleSendNotification(row);
                                        },
                                        disabled: isSent || isSending,
                                        style: {
                                            padding: "0.375rem 0.875rem",
                                            background: isSent ? "#9ca3af" : isSending ? "#d1d5db" : "#ef4444",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "8px",
                                            fontSize: "0.75rem",
                                            fontWeight: 700,
                                            cursor: isSent || isSending ? "not-allowed" : "pointer",
                                            whiteSpace: "nowrap",
                                            transition: "all 0.2s"
                                        },
                                        children: isSent ? "Sent ✓" : isSending ? "Sending..." : "Send Notification"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                                        lineNumber: 124,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                                    lineNumber: 123,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, rowKey, true, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                            lineNumber: 111,
                            columnNumber: 29
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
                    lineNumber: 92,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
            lineNumber: 79,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx",
        lineNumber: 78,
        columnNumber: 9
    }, this);
}
}),
"[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RecapsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$components$2f$admin$2f$PendingRecapsTable$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/src/components/admin/PendingRecapsTable.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function RecapsPage() {
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0); // 0: Pending, 1: Incomplete, 2: Reviewed
    // Tab 1 Data
    const [pendingRecaps, setPendingRecaps] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loadingPending, setLoadingPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    // Tab 2 Data
    const [incompleteRecaps, setIncompleteRecaps] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loadingIncomplete, setLoadingIncomplete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [sentReminders, setSentReminders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    // Tab 3 Data
    const [reviewedRecaps, setReviewedRecaps] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loadingReviewed, setLoadingReviewed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [selectedDate, setSelectedDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    });
    const fetchPending = async ()=>{
        setLoadingPending(true);
        try {
            const res = await fetch(`/api/admin/recaps?status=PENDING&noLimit=true`);
            if (res.ok) {
                const data = await res.json();
                // order oldest first
                const sorted = (data.recaps || []).sort((a, b)=>new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                setPendingRecaps(sorted);
            }
        } catch (e) {
            console.error("Failed to fetch pending recaps", e);
        }
        setLoadingPending(false);
    };
    const fetchIncomplete = async ()=>{
        setLoadingIncomplete(true);
        try {
            const res = await fetch(`/api/admin/recaps/incomplete`);
            if (res.ok) {
                const data = await res.json();
                setIncompleteRecaps(data.incomplete || []);
            }
        } catch (e) {
            console.error("Failed to fetch incomplete recaps", e);
        }
        setLoadingIncomplete(false);
    };
    const fetchReviewed = async (date)=>{
        setLoadingReviewed(true);
        try {
            const res = await fetch(`/api/admin/recaps?status=APPROVED,REJECTED&date=${date}`);
            if (res.ok) {
                const data = await res.json();
                setReviewedRecaps(data.recaps || []);
            }
        } catch (e) {
            console.error("Failed to fetch reviewed recaps", e);
        }
        setLoadingReviewed(false);
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (activeTab === 0) fetchPending();
        if (activeTab === 1) fetchIncomplete();
        if (activeTab === 2) fetchReviewed(selectedDate);
    }, [
        activeTab
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (activeTab === 2) fetchReviewed(selectedDate);
    }, [
        selectedDate
    ]);
    const statusBadge = (status)=>{
        const colors = {
            PENDING: {
                bg: "#fef3c7",
                color: "#92400e",
                label: "Pending"
            },
            APPROVED: {
                bg: "#d1fae5",
                color: "#065f46",
                label: "Approved"
            },
            REJECTED: {
                bg: "#fee2e2",
                color: "#991b1b",
                label: "Rejected"
            }
        };
        const s = colors[status] || colors.PENDING;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                padding: "0.25rem 0.75rem",
                borderRadius: "99px",
                fontSize: "0.7rem",
                fontWeight: 700,
                background: s.bg,
                color: s.color,
                textTransform: "uppercase",
                letterSpacing: "0.03em"
            },
            children: s.label
        }, void 0, false, {
            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
            lineNumber: 91,
            columnNumber: 13
        }, this);
    };
    const getRelativeTime = (isoString)=>{
        if (!isoString) return "Unknown";
        const ms = new Date().getTime() - new Date(isoString).getTime();
        const mins = Math.floor(ms / 60000);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (mins > 0) return `${mins} min${mins > 1 ? 's' : ''} ago`;
        return "Just now";
    };
    const thStyle = {
        textAlign: "left",
        padding: "0.75rem 1rem",
        borderBottom: "2px solid #e5e7eb",
        fontWeight: 700,
        color: "#6b7280",
        fontSize: "11px",
        textTransform: "uppercase",
        letterSpacing: "0.03em"
    };
    const tdStyle = {
        padding: "0.75rem 1rem",
        borderBottom: "1px solid #f3f4f6",
        color: "#111827",
        fontSize: "0.875rem"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            paddingBottom: '3rem'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "1rem"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "heading h2",
                            style: {
                                color: '#111827'
                            },
                            children: "Recaps"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                            lineNumber: 141,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-secondary",
                            style: {
                                color: '#6b7280'
                            },
                            children: "Review and approve submitted worker recaps."
                        }, void 0, false, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                            lineNumber: 142,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                    lineNumber: 140,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                lineNumber: 139,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    gap: "2rem",
                    borderBottom: "1px solid #e5e7eb",
                    marginTop: "1.5rem"
                },
                children: [
                    {
                        label: "Pending Review",
                        count: pendingRecaps.length
                    },
                    {
                        label: "Incomplete",
                        count: incompleteRecaps.length
                    },
                    {
                        label: "Reviewed",
                        count: 0
                    }
                ].map((tab, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        onClick: ()=>setActiveTab(i),
                        style: {
                            padding: "0.75rem 0",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontWeight: activeTab === i ? 700 : 500,
                            color: activeTab === i ? "#6366f1" : "#6b7280",
                            borderBottom: activeTab === i ? "2px solid #6366f1" : "2px solid transparent",
                            marginBottom: "-1px",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                        },
                        children: [
                            tab.label,
                            tab.count > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    background: i === 1 ? "#f59e0b" : "#6366f1",
                                    color: "white",
                                    fontSize: "0.7rem",
                                    padding: "0.1rem 0.5rem",
                                    borderRadius: "10px",
                                    fontWeight: 700
                                },
                                children: tab.count
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                lineNumber: 171,
                                columnNumber: 29
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                        lineNumber: 153,
                        columnNumber: 21
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                lineNumber: 147,
                columnNumber: 13
            }, this),
            activeTab === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card",
                style: {
                    marginTop: "1.5rem",
                    overflow: "hidden",
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                },
                children: loadingPending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        padding: "2rem",
                        textAlign: "center",
                        color: "#9ca3af"
                    },
                    children: "Loading pending recaps..."
                }, void 0, false, {
                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                    lineNumber: 190,
                    columnNumber: 25
                }, this) : pendingRecaps.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        padding: "4rem 2rem",
                        textAlign: "center"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: "2rem",
                                marginBottom: "0.5rem"
                            },
                            children: "✅"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                            lineNumber: 193,
                            columnNumber: 29
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            style: {
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                color: "#111827",
                                marginBottom: "0.25rem"
                            },
                            children: "All caught up!"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                            lineNumber: 194,
                            columnNumber: 29
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: {
                                color: "#6b7280"
                            },
                            children: "No recaps are currently waiting for your review."
                        }, void 0, false, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                            lineNumber: 195,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                    lineNumber: 192,
                    columnNumber: 25
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch"
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        style: {
                            width: "100%",
                            borderCollapse: "collapse"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: thStyle,
                                            children: "Employee Name"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                            lineNumber: 202,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: thStyle,
                                            children: "Store Name"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                            lineNumber: 203,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: thStyle,
                                            children: "Market"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                            lineNumber: 204,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: thStyle,
                                            children: "Shift Date"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                            lineNumber: 205,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: thStyle,
                                            children: "Submitted"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                            lineNumber: 206,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: thStyle,
                                            children: "Reimbursement"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                            lineNumber: 207,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: thStyle,
                                            children: "Action"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                            lineNumber: 208,
                                            columnNumber: 41
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                    lineNumber: 201,
                                    columnNumber: 37
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                lineNumber: 200,
                                columnNumber: 33
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: pendingRecaps.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: tdStyle,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontWeight: 600
                                                    },
                                                    children: r.workerName
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                    lineNumber: 214,
                                                    columnNumber: 65
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                lineNumber: 214,
                                                columnNumber: 45
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: tdStyle,
                                                children: r.storeName
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                lineNumber: 215,
                                                columnNumber: 45
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: tdStyle,
                                                children: r.marketName
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                lineNumber: 216,
                                                columnNumber: 45
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: tdStyle,
                                                children: r.shiftDate ? new Date(r.shiftDate).toLocaleDateString(undefined, {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : '—'
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                lineNumber: 217,
                                                columnNumber: 45
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: tdStyle,
                                                children: getRelativeTime(r.createdAt)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                lineNumber: 218,
                                                columnNumber: 45
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: tdStyle,
                                                children: [
                                                    "$",
                                                    (r.reimbursement || 0).toFixed(2)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                lineNumber: 219,
                                                columnNumber: 45
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: tdStyle,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                    href: `/admin/recaps/${r.id}`,
                                                    className: "btn-primary",
                                                    style: {
                                                        padding: "0.375rem 1rem",
                                                        background: "#6366f1",
                                                        color: "white",
                                                        borderRadius: "8px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: 700,
                                                        textDecoration: "none"
                                                    },
                                                    children: "View"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                    lineNumber: 221,
                                                    columnNumber: 49
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                lineNumber: 220,
                                                columnNumber: 45
                                            }, this)
                                        ]
                                    }, r.id, true, {
                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                        lineNumber: 213,
                                        columnNumber: 41
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                lineNumber: 211,
                                columnNumber: 33
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                        lineNumber: 199,
                        columnNumber: 29
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                    lineNumber: 198,
                    columnNumber: 25
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                lineNumber: 188,
                columnNumber: 17
            }, this),
            activeTab === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card",
                style: {
                    marginTop: "1.5rem",
                    overflow: "hidden",
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                },
                children: loadingIncomplete ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        padding: "2rem",
                        textAlign: "center",
                        color: "#9ca3af"
                    },
                    children: "Loading incomplete assignments..."
                }, void 0, false, {
                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                    lineNumber: 250,
                    columnNumber: 25
                }, this) : incompleteRecaps.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        padding: "4rem 2rem",
                        textAlign: "center"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: "2rem",
                                marginBottom: "0.5rem"
                            },
                            children: "🎉"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                            lineNumber: 253,
                            columnNumber: 29
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            style: {
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                color: "#111827",
                                marginBottom: "0.25rem"
                            },
                            children: "All recaps submitted!"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                            lineNumber: 254,
                            columnNumber: 29
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: {
                                color: "#6b7280"
                            },
                            children: "Every worker has submitted their recap for current shifts."
                        }, void 0, false, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                            lineNumber: 255,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                    lineNumber: 252,
                    columnNumber: 25
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$components$2f$admin$2f$PendingRecapsTable$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    recaps: incompleteRecaps
                }, void 0, false, {
                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                    lineNumber: 258,
                    columnNumber: 25
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                lineNumber: 248,
                columnNumber: 17
            }, this),
            activeTab === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: "1rem"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "date",
                            value: selectedDate,
                            onChange: (e)=>setSelectedDate(e.target.value),
                            style: {
                                padding: "0.5rem 1rem",
                                borderRadius: "10px",
                                border: "1px solid #e5e7eb",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                color: "#374151",
                                background: "white",
                                cursor: "pointer",
                                outline: "none",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
                            }
                        }, void 0, false, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                            lineNumber: 267,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                        lineNumber: 266,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "card",
                        style: {
                            marginTop: "1rem",
                            overflow: "hidden",
                            background: "#fff",
                            borderRadius: "12px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                        },
                        children: loadingReviewed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: {
                                padding: "2rem",
                                textAlign: "center",
                                color: "#9ca3af"
                            },
                            children: "Loading reviewed recaps..."
                        }, void 0, false, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                            lineNumber: 287,
                            columnNumber: 29
                        }, this) : reviewedRecaps.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                padding: "4rem 2rem",
                                textAlign: "center"
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: "#9ca3af",
                                    fontSize: "0.95rem"
                                },
                                children: "No reviewed recaps found for this date."
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                lineNumber: 290,
                                columnNumber: 33
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                            lineNumber: 289,
                            columnNumber: 29
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                overflowX: "auto",
                                WebkitOverflowScrolling: "touch"
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                style: {
                                    width: "100%",
                                    borderCollapse: "collapse"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: thStyle,
                                                    children: "Employee Name"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                    lineNumber: 297,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: thStyle,
                                                    children: "Store Name"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                    lineNumber: 298,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: thStyle,
                                                    children: "Market"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                    lineNumber: 299,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: thStyle,
                                                    children: "Shift Date"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                    lineNumber: 300,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: thStyle,
                                                    children: "Status"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                    lineNumber: 301,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: thStyle,
                                                    children: "Reimbursement"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                    lineNumber: 302,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: thStyle,
                                                    children: "Action"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                    lineNumber: 303,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                            lineNumber: 296,
                                            columnNumber: 41
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                        lineNumber: 295,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                        children: reviewedRecaps.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: tdStyle,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                fontWeight: 600
                                                            },
                                                            children: r.workerName
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                            lineNumber: 309,
                                                            columnNumber: 69
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                        lineNumber: 309,
                                                        columnNumber: 49
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: tdStyle,
                                                        children: r.storeName
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                        lineNumber: 310,
                                                        columnNumber: 49
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: tdStyle,
                                                        children: r.marketName
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                        lineNumber: 311,
                                                        columnNumber: 49
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: tdStyle,
                                                        children: r.shiftDate ? new Date(r.shiftDate).toLocaleDateString(undefined, {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        }) : '—'
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                        lineNumber: 312,
                                                        columnNumber: 49
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: tdStyle,
                                                        children: statusBadge(r.status)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                        lineNumber: 313,
                                                        columnNumber: 49
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: tdStyle,
                                                        children: [
                                                            "$",
                                                            (r.reimbursement || 0).toFixed(2)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                        lineNumber: 314,
                                                        columnNumber: 49
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: tdStyle,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                            href: `/admin/recaps/${r.id}`,
                                                            style: {
                                                                padding: "0.375rem 1rem",
                                                                background: "#6366f1",
                                                                color: "white",
                                                                borderRadius: "8px",
                                                                fontSize: "0.75rem",
                                                                fontWeight: 700,
                                                                textDecoration: "none"
                                                            },
                                                            children: "View"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                            lineNumber: 316,
                                                            columnNumber: 53
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                        lineNumber: 315,
                                                        columnNumber: 49
                                                    }, this)
                                                ]
                                            }, r.id, true, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                                lineNumber: 308,
                                                columnNumber: 45
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                        lineNumber: 306,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                                lineNumber: 294,
                                columnNumber: 33
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                            lineNumber: 293,
                            columnNumber: 29
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
                        lineNumber: 285,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/recaps/page.tsx",
        lineNumber: 138,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=Desktop_clock%20in%3Aout_apps_web_src_54c50630._.js.map