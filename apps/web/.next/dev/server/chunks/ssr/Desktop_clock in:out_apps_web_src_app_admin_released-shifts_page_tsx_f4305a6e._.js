module.exports = [
"[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ReleasedShiftsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function ReleasedShiftsPage() {
    const [assignments, setAssignments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [assigning, setAssigning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [workers, setWorkers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedWorker, setSelectedWorker] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetch("/api/admin/released-shifts").then((r)=>r.json()).then((d)=>setAssignments(Array.isArray(d) ? d : [])).catch(()=>{}).finally(()=>setLoading(false));
        fetch("/api/users/workers").then((r)=>r.json()).then((d)=>setWorkers(Array.isArray(d) ? d : [])).catch(()=>{});
    }, []);
    const handleDirectAssign = async (assignment)=>{
        const workerId = selectedWorker[assignment.id];
        if (!workerId) return alert("Select a worker first");
        setAssigning(assignment.id);
        try {
            // Approve a new shift request on behalf of this worker
            const reqRes = await fetch("/api/jobs/actions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action: "ACCEPT",
                    assignmentId: assignment.id
                })
            });
            // That API only works for the logged-in worker.
            // Admin direct-assign: use PATCH on the assignment to change workerId
            const res = await fetch(`/api/users/${workerId}/assignments`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    assignmentId: assignment.id,
                    directAssign: true,
                    newWorkerId: workerId
                })
            });
            if (res.ok) {
                setAssignments((prev)=>prev.filter((a)=>a.id !== assignment.id));
                alert("Shift assigned successfully");
            } else {
                const d = await res.json();
                alert(d.error || "Failed to assign");
            }
        } catch  {
            alert("Network error");
        } finally{
            setAssigning(null);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "heading h2",
                children: "Released Shifts"
            }, void 0, false, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                lineNumber: 63,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-secondary",
                style: {
                    marginBottom: "2rem"
                },
                children: "Shifts released by workers that are waiting for a new worker to pick them up."
            }, void 0, false, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                lineNumber: 64,
                columnNumber: 13
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    color: "#9ca3af"
                },
                children: "Loading..."
            }, void 0, false, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                lineNumber: 69,
                columnNumber: 17
            }, this) : assignments.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card glass",
                style: {
                    padding: "3rem",
                    textAlign: "center"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: "#9ca3af",
                        fontSize: "1rem"
                    },
                    children: "No released shifts available."
                }, void 0, false, {
                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                    lineNumber: 72,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                lineNumber: 71,
                columnNumber: 17
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem"
                },
                children: assignments.map((a)=>{
                    const dateStr = a.date ? new Date(a.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric"
                    }) : "—";
                    const marketWorkers = workers.filter((w)=>w.marketId === a.job?.market?.id);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "card glass",
                        style: {
                            borderLeft: "4px solid #f59e0b"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                flexWrap: "wrap",
                                gap: "1rem"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontWeight: 700,
                                                fontSize: "1rem",
                                                margin: "0 0 0.25rem"
                                            },
                                            children: [
                                                a.job?.store?.name,
                                                " · ",
                                                dateStr
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                            lineNumber: 85,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                color: "#6b7280",
                                                fontSize: "0.875rem",
                                                margin: "0 0 0.25rem"
                                            },
                                            children: [
                                                a.job?.startTimeStr,
                                                " – ",
                                                a.job?.endTimeStr,
                                                " · ",
                                                a.job?.market?.name
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                            lineNumber: 88,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                color: "#b45309",
                                                fontSize: "0.8rem",
                                                margin: 0
                                            },
                                            children: [
                                                "Released by: ",
                                                a.worker?.name
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                            lineNumber: 91,
                                            columnNumber: 41
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                    lineNumber: 84,
                                    columnNumber: 37
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: "flex",
                                        gap: "0.5rem",
                                        alignItems: "center"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            value: selectedWorker[a.id] || "",
                                            onChange: (e)=>setSelectedWorker((prev)=>({
                                                        ...prev,
                                                        [a.id]: e.target.value
                                                    })),
                                            style: {
                                                padding: "0.5rem",
                                                borderRadius: "8px",
                                                border: "1px solid #d1d5db",
                                                fontSize: "0.875rem"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "",
                                                    children: "Select worker..."
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                    lineNumber: 101,
                                                    columnNumber: 45
                                                }, this),
                                                marketWorkers.map((w)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: w.id,
                                                        children: w.name
                                                    }, w.id, false, {
                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                        lineNumber: 103,
                                                        columnNumber: 49
                                                    }, this))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                            lineNumber: 96,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleDirectAssign(a),
                                            disabled: assigning === a.id || !selectedWorker[a.id],
                                            style: {
                                                padding: "0.5rem 1rem",
                                                background: "#4f46e5",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "8px",
                                                fontWeight: 600,
                                                cursor: "pointer",
                                                fontSize: "0.875rem",
                                                opacity: assigning === a.id || !selectedWorker[a.id] ? 0.6 : 1
                                            },
                                            children: assigning === a.id ? "Assigning..." : "Assign"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                            lineNumber: 106,
                                            columnNumber: 41
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                    lineNumber: 95,
                                    columnNumber: 37
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                            lineNumber: 83,
                            columnNumber: 33
                        }, this)
                    }, a.id, false, {
                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                        lineNumber: 82,
                        columnNumber: 29
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                lineNumber: 75,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
        lineNumber: 62,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=Desktop_clock%20in%3Aout_apps_web_src_app_admin_released-shifts_page_tsx_f4305a6e._.js.map