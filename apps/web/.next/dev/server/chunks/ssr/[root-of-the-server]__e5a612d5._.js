module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/Desktop/clock in:out/apps/web/src/app/admin/admin.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "active": "admin-module__qUpZGW__active",
  "backButton": "admin-module__qUpZGW__backButton",
  "backLink": "admin-module__qUpZGW__backLink",
  "badge": "admin-module__qUpZGW__badge",
  "closeMenu": "admin-module__qUpZGW__closeMenu",
  "desktopOnlyBtn": "admin-module__qUpZGW__desktopOnlyBtn",
  "floatingBtn": "admin-module__qUpZGW__floatingBtn",
  "hamburger": "admin-module__qUpZGW__hamburger",
  "iconBtn": "admin-module__qUpZGW__iconBtn",
  "iconContainer": "admin-module__qUpZGW__iconContainer",
  "layout": "admin-module__qUpZGW__layout",
  "logo": "admin-module__qUpZGW__logo",
  "main": "admin-module__qUpZGW__main",
  "messageChat": "admin-module__qUpZGW__messageChat",
  "messageChatHidden": "admin-module__qUpZGW__messageChatHidden",
  "messageContainer": "admin-module__qUpZGW__messageContainer",
  "messageSidebar": "admin-module__qUpZGW__messageSidebar",
  "messageSidebarHidden": "admin-module__qUpZGW__messageSidebarHidden",
  "mobileActions": "admin-module__qUpZGW__mobileActions",
  "mobileHeader": "admin-module__qUpZGW__mobileHeader",
  "mobileTitle": "admin-module__qUpZGW__mobileTitle",
  "nav": "admin-module__qUpZGW__nav",
  "navLink": "admin-module__qUpZGW__navLink",
  "overlay": "admin-module__qUpZGW__overlay",
  "sidebar": "admin-module__qUpZGW__sidebar",
  "sidebarActive": "admin-module__qUpZGW__sidebarActive",
  "sidebarFooter": "admin-module__qUpZGW__sidebarFooter",
  "threadItem": "admin-module__qUpZGW__threadItem",
  "threadItemActive": "admin-module__qUpZGW__threadItemActive",
});
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/Desktop/clock in:out/apps/web/src/app/admin/LogoutButton.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LogoutButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/navigation.js [app-ssr] (ecmascript)");
"use client";
;
;
function LogoutButton() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const handleLogout = async ()=>{
        await fetch("/api/auth/logout", {
            method: "POST"
        });
        router.push("/login");
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: handleLogout,
        style: {
            width: "100%",
            padding: "0.75rem 1rem",
            background: "rgba(239, 68, 68, 0.15)",
            color: "#ef4444",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.875rem",
            transition: "all 0.2s ease"
        },
        children: "Logout"
    }, void 0, false, {
        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/LogoutButton.tsx",
        lineNumber: 14,
        columnNumber: 9
    }, this);
}
}),
"[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/src/app/admin/admin.module.css [app-ssr] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$LogoutButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/src/app/admin/LogoutButton.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function ChangePasswordModal({ onClose }) {
    const [current, setCurrent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [next, setNext] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [confirm, setConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleSave = async ()=>{
        setError("");
        if (!current || !next || !confirm) {
            setError("All fields are required.");
            return;
        }
        if (next.length < 8) {
            setError("New password must be at least 8 characters.");
            return;
        }
        if (next !== confirm) {
            setError("New passwords do not match.");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    currentPassword: current,
                    newPassword: next
                })
            });
            const data = await res.json();
            if (res.ok) {
                onClose();
            } else {
                setError(data.error || "Failed to update password.");
            }
        } catch  {
            setError("Network error. Please try again.");
        } finally{
            setSaving(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "1rem"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                background: "#fff",
                borderRadius: 20,
                padding: "2rem",
                width: "100%",
                maxWidth: 420,
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    style: {
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: "#111827",
                        marginBottom: "1.5rem"
                    },
                    children: "Change Password"
                }, void 0, false, {
                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                    lineNumber: 38,
                    columnNumber: 17
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: "#EF4444",
                        fontSize: "0.875rem",
                        marginBottom: "1rem",
                        background: "#FEF2F2",
                        padding: "0.75rem",
                        borderRadius: 8
                    },
                    children: error
                }, void 0, false, {
                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                    lineNumber: 39,
                    columnNumber: 27
                }, this),
                [
                    [
                        "Current Password",
                        current,
                        setCurrent
                    ],
                    [
                        "New Password",
                        next,
                        setNext
                    ],
                    [
                        "Confirm New Password",
                        confirm,
                        setConfirm
                    ]
                ].map(([label, val, setter])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginBottom: "1rem"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                style: {
                                    display: "block",
                                    fontSize: "0.8125rem",
                                    fontWeight: 600,
                                    color: "#374151",
                                    marginBottom: 6
                                },
                                children: label
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 42,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "password",
                                value: val,
                                onChange: (e)=>setter(e.target.value),
                                placeholder: label === "New Password" ? "Min. 8 characters" : "",
                                style: {
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid #E5E7EB",
                                    borderRadius: 10,
                                    fontSize: "0.9375rem",
                                    color: "#111827",
                                    background: "#F9FAFB",
                                    boxSizing: "border-box"
                                }
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 43,
                                columnNumber: 25
                            }, this)
                        ]
                    }, label, true, {
                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                        lineNumber: 41,
                        columnNumber: 21
                    }, this)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: "flex",
                        gap: "0.75rem",
                        marginTop: "1.25rem"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            style: {
                                flex: 1,
                                padding: "0.75rem",
                                border: "1px solid #E5E7EB",
                                borderRadius: 10,
                                background: "#fff",
                                color: "#374151",
                                fontWeight: 600,
                                cursor: "pointer"
                            },
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                            lineNumber: 49,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleSave,
                            disabled: saving,
                            style: {
                                flex: 1,
                                padding: "0.75rem",
                                border: "none",
                                borderRadius: 10,
                                background: saving ? "#A5B4FC" : "#6366F1",
                                color: "#fff",
                                fontWeight: 700,
                                cursor: saving ? "not-allowed" : "pointer"
                            },
                            children: saving ? "Saving…" : "Update Password"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                            lineNumber: 50,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                    lineNumber: 48,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
            lineNumber: 37,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
        lineNumber: 36,
        columnNumber: 9
    }, this);
}
function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showPasswordModal, setShowPasswordModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [stats, setStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        role: ""
    });
    const [badges, setBadges] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        recaps: 0,
        shiftApprovals: 0,
        releasedShifts: 0,
        messages: 0
    });
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const fetchUserAndBadges = async ()=>{
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                setStats({
                    role: data.user.role
                });
            }
            // Fetch badge counts
            const badgesRes = await fetch("/api/admin/notifications/counts");
            if (badgesRes.ok) {
                const b = await badgesRes.json();
                setBadges({
                    ...b
                });
            }
        };
        fetchUserAndBadges();
        // Polling every 30 seconds for live updates
        const intervalId = setInterval(async ()=>{
            const badgesRes = await fetch("/api/admin/notifications/counts");
            if (badgesRes.ok) {
                setBadges(await badgesRes.json());
            }
        }, 30000);
        return ()=>clearInterval(intervalId);
    }, []);
    // Close sidebar when navigating
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setIsSidebarOpen(false);
    }, [
        pathname
    ]);
    const { role } = stats;
    const portalTitle = role === "ADMIN" ? "Admin Portal" : "Manager Portal";
    const isReportPage = pathname.includes("/admin/reports/payroll/user/");
    if (isReportPage) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            style: {
                width: "100%",
                minHeight: "100vh",
                backgroundColor: "white"
            },
            children: children
        }, void 0, false, {
            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
            lineNumber: 108,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].layout,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].mobileHeader,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].mobileTitle,
                        children: "Kruto Tastes"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                        lineNumber: 118,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].mobileActions,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/admin/messages",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].iconBtn,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].iconContainer,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            width: "20",
                                            height: "20",
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                                lineNumber: 123,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                            lineNumber: 122,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].badge,
                                            children: "2"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                            lineNumber: 125,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                    lineNumber: 121,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 120,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/admin/shift-release-approvals",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].iconBtn,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].iconContainer,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            width: "20",
                                            height: "20",
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                                    lineNumber: 131,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M13.73 21a2 2 0 0 1-3.46 0"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                                    lineNumber: 132,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                            lineNumber: 130,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].badge,
                                            children: "5"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                            lineNumber: 134,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                    lineNumber: 129,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 128,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].iconBtn,
                                onClick: ()=>setIsSidebarOpen(true),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    width: "24",
                                    height: "24",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                            x1: "3",
                                            y1: "12",
                                            x2: "21",
                                            y2: "12"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                            lineNumber: 139,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                            x1: "3",
                                            y1: "6",
                                            x2: "21",
                                            y2: "6"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                            lineNumber: 140,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                            x1: "3",
                                            y1: "18",
                                            x2: "21",
                                            y2: "18"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                            lineNumber: 141,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                    lineNumber: 138,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 137,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                        lineNumber: 119,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                lineNumber: 117,
                columnNumber: 13
            }, this),
            isSidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].overlay,
                onClick: ()=>setIsSidebarOpen(false)
            }, void 0, false, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                lineNumber: 148,
                columnNumber: 31
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sidebar} ${isSidebarOpen ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sidebarActive : ""}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].logo,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "heading h4",
                                children: portalTitle
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 152,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].iconBtn} ${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].closeMenu}`,
                                onClick: ()=>setIsSidebarOpen(false),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    width: "24",
                                    height: "24",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                            x1: "18",
                                            y1: "6",
                                            x2: "6",
                                            y2: "18"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                            lineNumber: 155,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                            x1: "6",
                                            y1: "6",
                                            x2: "18",
                                            y2: "18"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                            lineNumber: 156,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                    lineNumber: 154,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 153,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                        lineNumber: 151,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].nav,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/admin/dashboard",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navLink} ${pathname === '/admin/dashboard' ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].active : ''}`,
                                children: "Dashboard"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 161,
                                columnNumber: 21
                            }, this),
                            role === "ADMIN" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/admin/markets",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navLink} ${pathname === '/admin/markets' ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].active : ''}`,
                                children: "Markets"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 162,
                                columnNumber: 42
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/admin/stores",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navLink} ${pathname === '/admin/stores' ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].active : ''}`,
                                children: "Stores"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 163,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/admin/users",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navLink} ${pathname === '/admin/users' ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].active : ''}`,
                                children: "Users"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 164,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/admin/jobs",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navLink} ${pathname === '/admin/jobs' ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].active : ''}`,
                                children: "Jobs"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 165,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/admin/inventory",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navLink} ${pathname === '/admin/inventory' ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].active : ''}`,
                                children: "Inventory Items"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 166,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/admin/reports",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navLink} ${pathname === '/admin/reports' ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].active : ''}`,
                                children: "Reports"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 167,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/admin/messages",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navLink} ${pathname === '/admin/messages' ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].active : ''}`,
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                },
                                children: [
                                    "Messages",
                                    badges.messages > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: '#ef4444'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                        lineNumber: 170,
                                        columnNumber: 49
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 168,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/admin/recaps",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navLink} ${pathname === '/admin/recaps' ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].active : ''}`,
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                },
                                children: [
                                    "Recaps",
                                    badges.recaps > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: '#ef4444'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                        lineNumber: 174,
                                        columnNumber: 47
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 172,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/admin/shift-release-approvals",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navLink} ${pathname === '/admin/shift-release-approvals' ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].active : ''}`,
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                },
                                children: [
                                    "Shift Release Approvals",
                                    badges.shiftApprovals > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: '#ef4444'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                        lineNumber: 178,
                                        columnNumber: 55
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 176,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/admin/released-shifts",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navLink} ${pathname === '/admin/released-shifts' ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].active : ''}`,
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                },
                                children: [
                                    "Released Shifts",
                                    badges.releasedShifts > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: '#ef4444'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                        lineNumber: 182,
                                        columnNumber: 55
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 180,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                        lineNumber: 160,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sidebarFooter,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowPasswordModal(true),
                                style: {
                                    width: "100%",
                                    padding: "0.75rem 1rem",
                                    marginBottom: "0.5rem",
                                    background: "rgba(99,102,241,0.1)",
                                    color: "#6366f1",
                                    border: "1px solid rgba(99,102,241,0.3)",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: "0.875rem"
                                },
                                children: "Change Password"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 186,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$LogoutButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                                lineNumber: 197,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                        lineNumber: 185,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                lineNumber: 150,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$admin$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].main,
                children: children
            }, void 0, false, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                lineNumber: 200,
                columnNumber: 13
            }, this),
            showPasswordModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ChangePasswordModal, {
                onClose: ()=>setShowPasswordModal(false)
            }, void 0, false, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
                lineNumber: 203,
                columnNumber: 35
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/layout.tsx",
        lineNumber: 115,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e5a612d5._.js.map