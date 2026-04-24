(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ReleasedShiftsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function ReleasedShiftsPage() {
    _s();
    const [releases, setReleases] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Modal state
    const [isAssignModalOpen, setIsAssignModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedRelease, setSelectedRelease] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [workers, setWorkers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedWorkerId, setSelectedWorkerId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [assignLoading, setAssignLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [workersLoading, setWorkersLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReleasedShiftsPage.useEffect": ()=>{
            async function fetchUnassignedReleases() {
                try {
                    const res = await fetch("/api/admin/released-shifts");
                    if (res.ok) {
                        setReleases(await res.json());
                    }
                } catch (e) {
                    console.error("Failed to load released shifts", e);
                } finally{
                    setLoading(false);
                }
            }
            fetchUnassignedReleases();
        }
    }["ReleasedShiftsPage.useEffect"], []);
    // Fetch workers when modal opens
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReleasedShiftsPage.useEffect": ()=>{
            if (isAssignModalOpen && selectedRelease) {
                setWorkersLoading(true);
                // Use /users/workers — already scoped to market, returns only WORKERs
                fetch(`/api/users/workers`).then({
                    "ReleasedShiftsPage.useEffect": (res)=>res.json()
                }["ReleasedShiftsPage.useEffect"]).then({
                    "ReleasedShiftsPage.useEffect": (data)=>{
                        const marketWorkers = (data || []).filter({
                            "ReleasedShiftsPage.useEffect.marketWorkers": (u)=>u.marketId === selectedRelease.job.marketId
                        }["ReleasedShiftsPage.useEffect.marketWorkers"]);
                        setWorkers(marketWorkers);
                    }
                }["ReleasedShiftsPage.useEffect"]).catch({
                    "ReleasedShiftsPage.useEffect": (e)=>console.error("Failed to fetch workers", e)
                }["ReleasedShiftsPage.useEffect"]).finally({
                    "ReleasedShiftsPage.useEffect": ()=>setWorkersLoading(false)
                }["ReleasedShiftsPage.useEffect"]);
            }
        }
    }["ReleasedShiftsPage.useEffect"], [
        isAssignModalOpen,
        selectedRelease
    ]);
    const openAssignModal = (release)=>{
        setSelectedRelease(release);
        setSelectedWorkerId("");
        setIsAssignModalOpen(true);
    };
    const handleAssign = async ()=>{
        if (!selectedWorkerId) return alert("Please select a worker first.");
        setAssignLoading(true);
        try {
            const res = await fetch("/api/admin/released-shifts/assign", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    openJobId: selectedRelease.openJobId,
                    workerId: selectedWorkerId,
                    date: selectedRelease.date
                })
            });
            if (res.ok) {
                setIsAssignModalOpen(false);
                // Remove the assigned shift from the list
                setReleases((prev)=>prev.filter((r)=>r.id !== selectedRelease.id));
            } else {
                const data = await res.json();
                alert(data.error || "Failed to assign shift");
            }
        } catch (e) {
            alert("Network error occurred while assigning shift");
        } finally{
            setAssignLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            minHeight: "100vh",
            background: "#f8f9fb",
            fontFamily: "Inter, sans-serif"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                style: {
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "16px",
                    margin: "2rem 1.5rem 0",
                    boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
                    overflow: "hidden",
                    position: "sticky",
                    top: "1.5rem",
                    zIndex: 100
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        maxWidth: 960,
                        margin: "0 auto",
                        padding: "0 1.5rem",
                        height: 60,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                style: {
                                    fontSize: "1.125rem",
                                    fontWeight: 700,
                                    margin: 0,
                                    color: "#111827"
                                },
                                children: "Released Shifts"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                lineNumber: 109,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: "#6b7280",
                                    margin: "0.25rem 0 0 0",
                                    fontSize: "0.875rem"
                                },
                                children: "Approved shift releases that have not yet been picked up by another worker."
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                lineNumber: 112,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                        lineNumber: 108,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                    lineNumber: 99,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                lineNumber: 88,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                style: {
                    maxWidth: 960,
                    margin: "2rem auto",
                    padding: "0 1.5rem",
                    paddingBottom: "4rem"
                },
                children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        padding: '3rem',
                        textAlign: 'center',
                        color: '#6b7280'
                    },
                    children: "Loading unassigned releases..."
                }, void 0, false, {
                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                    lineNumber: 121,
                    columnNumber: 21
                }, this) : releases.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "card glass animate-fade-in",
                    style: {
                        padding: '3rem',
                        textAlign: 'center',
                        marginTop: '2rem'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem auto'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "40",
                                height: "40",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "1.5",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                style: {
                                    opacity: 0.5
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                        lineNumber: 126,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                        points: "9 12 11 14 15 10"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                        lineNumber: 127,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                lineNumber: 125,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                            lineNumber: 124,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "heading h3",
                            children: "All Good!"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                            lineNumber: 130,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: {
                                color: '#6b7280',
                                maxWidth: '400px',
                                margin: '0.5rem auto 0 auto'
                            },
                            children: "There are currently no open released shifts. All approved releases have been picked up."
                        }, void 0, false, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                            lineNumber: 131,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                    lineNumber: 123,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                        marginTop: '2rem'
                    },
                    children: releases.map((release)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "animate-fade-in",
                            style: {
                                background: "white",
                                borderRadius: "12px",
                                padding: "1.5rem",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                borderLeft: "4px solid #f59e0b",
                                display: "flex",
                                flexDirection: "column"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        marginBottom: "0.75rem"
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            margin: 0,
                                            fontSize: "1.125rem",
                                            color: "#111827",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.75rem",
                                            flexWrap: "wrap"
                                        },
                                        children: [
                                            release.job.title.split(' - ')[0],
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    color: "#b91c1c",
                                                    fontSize: "0.75rem",
                                                    fontWeight: 600,
                                                    padding: "0.2rem 0.6rem",
                                                    background: "#fee2e2",
                                                    borderRadius: "12px"
                                                },
                                                children: [
                                                    "Released by ",
                                                    release.worker.name
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                lineNumber: 150,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                        lineNumber: 148,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                    lineNumber: 147,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        color: "#4b5563",
                                        fontSize: "0.875rem",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.5rem"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.5rem"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    width: "14",
                                                    height: "14",
                                                    viewBox: "0 0 24 24",
                                                    fill: "none",
                                                    stroke: "currentColor",
                                                    strokeWidth: "2",
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                            lineNumber: 157,
                                                            columnNumber: 184
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                                            points: "9 22 9 12 15 12 15 22"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                            lineNumber: 157,
                                                            columnNumber: 248
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                    lineNumber: 157,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "Store:"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                    lineNumber: 158,
                                                    columnNumber: 41
                                                }, this),
                                                " ",
                                                release.job.store.name
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                            lineNumber: 156,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.5rem"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    width: "14",
                                                    height: "14",
                                                    viewBox: "0 0 24 24",
                                                    fill: "none",
                                                    stroke: "currentColor",
                                                    strokeWidth: "2",
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                            x: "3",
                                                            y: "4",
                                                            width: "18",
                                                            height: "18",
                                                            rx: "2",
                                                            ry: "2"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                            lineNumber: 161,
                                                            columnNumber: 184
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                            x1: "16",
                                                            y1: "2",
                                                            x2: "16",
                                                            y2: "6"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                            lineNumber: 161,
                                                            columnNumber: 246
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                            x1: "8",
                                                            y1: "2",
                                                            x2: "8",
                                                            y2: "6"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                            lineNumber: 161,
                                                            columnNumber: 289
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                            x1: "3",
                                                            y1: "10",
                                                            x2: "21",
                                                            y2: "10"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                            lineNumber: 161,
                                                            columnNumber: 330
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                    lineNumber: 161,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "Date:"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                    lineNumber: 162,
                                                    columnNumber: 41
                                                }, this),
                                                " ",
                                                release.date ? new Date(release.date).toLocaleDateString(undefined, {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : "Recurring"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                            lineNumber: 160,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.5rem"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    width: "14",
                                                    height: "14",
                                                    viewBox: "0 0 24 24",
                                                    fill: "none",
                                                    stroke: "currentColor",
                                                    strokeWidth: "2",
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                            cx: "12",
                                                            cy: "12",
                                                            r: "10"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                            lineNumber: 165,
                                                            columnNumber: 184
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                                            points: "12 6 12 12 16 14"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                            lineNumber: 165,
                                                            columnNumber: 224
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                    lineNumber: 165,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "Time:"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                    lineNumber: 166,
                                                    columnNumber: 41
                                                }, this),
                                                " ",
                                                release.job.startTimeStr,
                                                " - ",
                                                release.job.endTimeStr
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                            lineNumber: 164,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                marginTop: "0.5rem",
                                                borderTop: "1px solid #f3f4f6",
                                                paddingTop: "1rem"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "0.5rem",
                                                        color: "#d97706",
                                                        fontWeight: 500
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            width: "14",
                                                            height: "14",
                                                            viewBox: "0 0 24 24",
                                                            fill: "none",
                                                            stroke: "currentColor",
                                                            strokeWidth: "2",
                                                            strokeLinecap: "round",
                                                            strokeLinejoin: "round",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                                    cx: "12",
                                                                    cy: "12",
                                                                    r: "10"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                                    lineNumber: 171,
                                                                    columnNumber: 188
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                                    x1: "12",
                                                                    y1: "8",
                                                                    x2: "12",
                                                                    y2: "12"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                                    lineNumber: 171,
                                                                    columnNumber: 228
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                                    x1: "12",
                                                                    y1: "16",
                                                                    x2: "12.01",
                                                                    y2: "16"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                                    lineNumber: 171,
                                                                    columnNumber: 272
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                            lineNumber: 171,
                                                            columnNumber: 45
                                                        }, this),
                                                        "Status: Waiting for new worker"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                    lineNumber: 170,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>openAssignModal(release),
                                                    style: {
                                                        background: "#4f46e5",
                                                        color: "white",
                                                        border: "none",
                                                        padding: "0.5rem 1rem",
                                                        borderRadius: "8px",
                                                        cursor: "pointer",
                                                        fontWeight: 500,
                                                        fontSize: "0.875rem",
                                                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                                                    },
                                                    children: "Assign Shift"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                    lineNumber: 174,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                            lineNumber: 169,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                    lineNumber: 155,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, release.id, true, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                            lineNumber: 138,
                            columnNumber: 29
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                    lineNumber: 136,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                lineNumber: 119,
                columnNumber: 13
            }, this),
            isAssignModalOpen && selectedRelease && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0,0,0,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 999
                },
                onClick: ()=>setIsAssignModalOpen(false),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: "white",
                        borderRadius: "16px",
                        padding: "2rem",
                        width: "100%",
                        maxWidth: "450px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    },
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "1.5rem"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    style: {
                                        margin: 0,
                                        fontSize: "1.25rem",
                                        color: "#111827"
                                    },
                                    children: "Assign Shift"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                    lineNumber: 210,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsAssignModalOpen(false),
                                    style: {
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#6b7280"
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: "24",
                                        height: "24",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                x1: "18",
                                                y1: "6",
                                                x2: "6",
                                                y2: "18"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                lineNumber: 212,
                                                columnNumber: 176
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                x1: "6",
                                                y1: "6",
                                                x2: "18",
                                                y2: "18"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                lineNumber: 212,
                                                columnNumber: 219
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                        lineNumber: 212,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                    lineNumber: 211,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                            lineNumber: 209,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginBottom: "1.5rem",
                                padding: "1rem",
                                background: "#f9fafb",
                                borderRadius: "8px",
                                border: "1px solid #e5e7eb"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        margin: "0 0 0.25rem 0",
                                        fontWeight: 600,
                                        color: "#374151"
                                    },
                                    children: selectedRelease.job.store.name
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                    lineNumber: 217,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        margin: "0 0 0.25rem 0",
                                        fontSize: "0.875rem",
                                        color: "#4b5563"
                                    },
                                    children: [
                                        selectedRelease.date ? new Date(selectedRelease.date).toLocaleDateString() : "Recurring",
                                        " • ",
                                        selectedRelease.job.startTimeStr,
                                        " - ",
                                        selectedRelease.job.endTimeStr
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                    lineNumber: 218,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                            lineNumber: 216,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: {
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        color: "#374151"
                                    },
                                    children: "Select Worker to Assign"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                    lineNumber: 224,
                                    columnNumber: 29
                                }, this),
                                workersLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        padding: "0.75rem",
                                        background: "#f3f4f6",
                                        borderRadius: "8px",
                                        color: "#6b7280",
                                        fontSize: "0.875rem"
                                    },
                                    children: "Loading workers in market..."
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                    lineNumber: 226,
                                    columnNumber: 33
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    value: selectedWorkerId,
                                    onChange: (e)=>setSelectedWorkerId(e.target.value),
                                    style: {
                                        width: "100%",
                                        padding: "0.75rem",
                                        borderRadius: "8px",
                                        border: "1px solid #d1d5db",
                                        background: "white",
                                        fontSize: "0.875rem",
                                        color: "#111827"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            children: "-- Choose a worker --"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                            lineNumber: 238,
                                            columnNumber: 37
                                        }, this),
                                        workers.map((worker)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: worker.id,
                                                children: [
                                                    worker.name,
                                                    " (",
                                                    worker.email,
                                                    ")"
                                                ]
                                            }, worker.id, true, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                                lineNumber: 240,
                                                columnNumber: 41
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                    lineNumber: 230,
                                    columnNumber: 33
                                }, this),
                                workers.length === 0 && !workersLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: "0.75rem",
                                        color: "#ef4444",
                                        margin: "0.25rem 0 0 0"
                                    },
                                    children: "No workers found in this market."
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                    lineNumber: 247,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                            lineNumber: 223,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "0.75rem",
                                marginTop: "2rem"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsAssignModalOpen(false),
                                    style: {
                                        padding: "0.6rem 1rem",
                                        border: "1px solid #d1d5db",
                                        background: "white",
                                        color: "#374151",
                                        borderRadius: "8px",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                        fontSize: "0.875rem"
                                    },
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                    lineNumber: 254,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleAssign,
                                    disabled: assignLoading || !selectedWorkerId,
                                    style: {
                                        padding: "0.6rem 1.25rem",
                                        border: "none",
                                        background: assignLoading || !selectedWorkerId ? "#9ca3af" : "#4f46e5",
                                        color: "white",
                                        borderRadius: "8px",
                                        fontWeight: 500,
                                        cursor: assignLoading || !selectedWorkerId ? "not-allowed" : "pointer",
                                        fontSize: "0.875rem",
                                        transition: "background 0.2s"
                                    },
                                    children: assignLoading ? "Assigning..." : "Assign Shift"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                                    lineNumber: 263,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                            lineNumber: 253,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                    lineNumber: 205,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
                lineNumber: 200,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/released-shifts/page.tsx",
        lineNumber: 87,
        columnNumber: 9
    }, this);
}
_s(ReleasedShiftsPage, "/5gCVtYHnLGN4VX6UcXjzlm/W8A=");
_c = ReleasedShiftsPage;
var _c;
__turbopack_context__.k.register(_c, "ReleasedShiftsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Desktop_clock%20in%3Aout_apps_web_src_app_admin_released-shifts_page_tsx_59038621._.js.map