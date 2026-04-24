module.exports = [
"[project]/Desktop/clock in:out/apps/web/src/app/admin/users/users.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "container": "users-module__WMdz1W__container",
  "formRow": "users-module__WMdz1W__formRow",
  "grid": "users-module__WMdz1W__grid",
  "header": "users-module__WMdz1W__header",
  "inputGroup": "users-module__WMdz1W__inputGroup",
  "statusDot": "users-module__WMdz1W__statusDot",
  "table": "users-module__WMdz1W__table",
  "tableWrapper": "users-module__WMdz1W__tableWrapper",
  "userInfo": "users-module__WMdz1W__userInfo",
});
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/worker_threads [external] (worker_threads, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("worker_threads", () => require("worker_threads"));

module.exports = mod;
}),
"[project]/Desktop/clock in:out/apps/web/src/lib/pdf-service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateUserReportPDF",
    ()=>generateUserReportPDF
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jspdf/dist/jspdf.node.min.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.mjs [app-ssr] (ecmascript)");
;
;
const generateUserReportPDF = (user)=>{
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsPDF"]();
    const payRate = user.hourlyWage || 0;
    const totalWage = user.workedHours * payRate;
    const totalPay = totalWage + user.totalReimbursement;
    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 44, 52);
    doc.text("Payroll Report", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    // User Information section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Employee Information", 14, 45);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
        startY: 50,
        head: [
            [
                'Field',
                'Details'
            ]
        ],
        body: [
            [
                'Name',
                user.name
            ],
            [
                'Email',
                user.email
            ],
            [
                'Role',
                user.role
            ]
        ],
        theme: 'striped',
        headStyles: {
            fillColor: [
                63,
                81,
                181
            ]
        }
    });
    // Payroll Summary section
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.text("Payroll Summary", 14, finalY);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
        startY: finalY + 5,
        head: [
            [
                'Description',
                'Amount / Value'
            ]
        ],
        body: [
            [
                'Worked Hours',
                `${user.workedHours.toFixed(2)}h`
            ],
            [
                'Pay Rate',
                `$${payRate.toFixed(2)}/hr`
            ],
            [
                'Reimbursement',
                `$${user.totalReimbursement.toFixed(2)}`
            ],
            [
                'Total Wage (Hours * Rate)',
                `$${totalWage.toFixed(2)}`
            ],
            [
                'TOTAL PAY FOR CYCLE',
                `$${totalPay.toFixed(2)}`
            ]
        ],
        theme: 'grid',
        headStyles: {
            fillColor: [
                46,
                125,
                50
            ]
        },
        columnStyles: {
            1: {
                halign: 'right',
                fontStyle: 'bold'
            }
        },
        didParseCell: function(data) {
            if (data.row.index === 4) {
                data.cell.styles.fillColor = [
                    232,
                    245,
                    233
                ];
                data.cell.styles.textColor = [
                    46,
                    125,
                    50
                ];
            }
        }
    });
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++){
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Workforce Management System - Confidential", 14, doc.internal.pageSize.height - 10);
    }
    // Save the PDF
    const filename = `Payroll_Report_${user.name.replace(/\s+/g, "_")}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
};
}),
"[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminUsersPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/src/app/admin/users/users.module.css [app-ssr] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$pdf$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/src/lib/pdf-service.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function AdminUsersPage() {
    const [users, setUsers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [currentUser, setCurrentUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editingUserId, setEditingUserId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editForm, setEditForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    // Invite Form State
    const [inviteEmail, setInviteEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [inviteRole, setInviteRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("WORKER");
    const [inviteMarketId, setInviteMarketId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [inviteStoreId, setInviteStoreId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [inviteHourlyWage, setInviteHourlyWage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("20.00");
    const [inviting, setInviting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [inviteLink, setInviteLink] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [markets, setMarkets] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    // Quick Job Modal State
    const [showJobModal, setShowJobModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedUser, setSelectedUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [stores, setStores] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    // Weekly Schedule State
    const [weekSchedule, setWeekSchedule] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ].map((day)=>({
            day,
            enabled: false,
            startTime: "09:00",
            endTime: "17:00",
            storeId: ""
        })));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchCurrentUser();
        fetchUsers();
        fetchStores();
        fetchMarkets();
    }, []);
    const fetchCurrentUser = async ()=>{
        const res = await fetch("/api/auth/me");
        if (res.ok) {
            const data = await res.json();
            const user = data.user;
            setCurrentUser(user);
            // /api/auth/me now returns managedMarketId directly from DB
            if (user.role === "MARKET_MANAGER" && user.managedMarketId) {
                setInviteMarketId(user.managedMarketId);
            }
        }
    };
    const fetchUsers = async ()=>{
        setLoading(true);
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            if (res.ok) {
                setUsers(data);
            } else {
                setError(data.error || "Failed to fetch users");
                if (data.details) console.error("User fetch details:", data.details);
            }
        } catch (err) {
            setError("Failed to fetch users");
        } finally{
            setLoading(false);
        }
    };
    const fetchStores = async ()=>{
        try {
            const res = await fetch("/api/stores");
            if (res.ok) {
                setStores(await res.json());
            }
        } catch (err) {}
    };
    const fetchMarkets = async ()=>{
        try {
            const res = await fetch("/api/markets");
            if (res.ok) {
                setMarkets(await res.json());
            }
        } catch (err) {}
    };
    const calculateDate = (dayName)=>{
        const days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ];
        const targetDay = days.indexOf(dayName);
        const today = new Date();
        const currentDay = today.getDay();
        let diff = targetDay - currentDay;
        if (diff < 0) diff += 7;
        const resultDate = new Date();
        resultDate.setDate(today.getDate() + diff);
        return resultDate.toISOString().split("T")[0];
    };
    const handleQuickJobSubmit = async (e)=>{
        e.preventDefault();
        if (!selectedUser) return;
        const activeDays = weekSchedule.filter((d)=>d.enabled && d.storeId);
        if (activeDays.length === 0) {
            setError("Please enable at least one day and select a store");
            return;
        }
        try {
            let successCount = 0;
            for (const dayData of activeDays){
                const date = calculateDate(dayData.day);
                const startDateTime = new Date(`${date}T${dayData.startTime}`);
                const endDateTime = new Date(`${date}T${dayData.endTime}`);
                const res = await fetch("/api/jobs", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        storeId: dayData.storeId,
                        workerId: selectedUser.id,
                        date,
                        startTime: startDateTime.toISOString(),
                        endTime: endDateTime.toISOString(),
                        status: "ASSIGNED"
                    })
                });
                if (res.ok) successCount++;
            }
            if (successCount > 0) {
                setSuccess(`Successfully scheduled ${successCount} jobs for ${selectedUser.name}`);
                setShowJobModal(false);
                fetchUsers();
            }
        } catch (err) {
            setError("An error occurred during bulk scheduling");
        }
    };
    const handleSendInvite = async (e)=>{
        e.preventDefault();
        setInviting(true);
        setError("");
        setInviteLink("");
        try {
            const res = await fetch("/api/invites", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: inviteEmail,
                    role: inviteRole,
                    marketId: inviteRole === "MARKET_MANAGER" || inviteRole === "WORKER" ? inviteMarketId : null,
                    hourlyWage: inviteHourlyWage ? parseFloat(inviteHourlyWage) : null
                })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(`Invite generated for ${inviteEmail} - opening your email client...`);
                setInviteLink(data.inviteLink);
                // Trigger mail client
                const subject = encodeURIComponent("You've been invited to Workforce OS!");
                const body = encodeURIComponent(`Hello,\n\nYou have been invited to join the Workforce OS team.\n\nClick the link below to accept your invitation and set up your account:\n${data.inviteLink}\n\nWelcome to the team!`);
                window.location.href = `mailto:${inviteEmail}?subject=${subject}&body=${body}`;
                setInviteEmail("");
                setInviteMarketId("");
                setInviteStoreId("");
            } else {
                setError(data.error || "Failed to send invite");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally{
            setInviting(false);
        }
    };
    const updateUserStatus = async (id, status)=>{
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status
                })
            });
            if (res.ok) {
                setSuccess("User status updated");
                fetchUsers();
            }
        } catch (err) {
            setError("Failed to update status");
        }
    };
    const startEditing = (user)=>{
        setEditingUserId(user.id);
        setEditForm({
            role: user.role,
            hourlyWage: user.hourlyWage?.toString() || "",
            manualWorkedHours: user.workedHours?.toString() || "",
            marketId: user.market?.id || user.managedMarket?.id || user.marketId || user.managedMarketId || ""
        });
    };
    const handleCancelEdit = ()=>{
        setEditingUserId(null);
        setEditForm({});
    };
    const handleSaveEdit = async (userId)=>{
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    role: editForm.role,
                    hourlyWage: editForm.hourlyWage ? parseFloat(editForm.hourlyWage) : null,
                    manualWorkedHours: editForm.manualWorkedHours ? parseFloat(editForm.manualWorkedHours) : null,
                    marketId: editForm.role === "MARKET_MANAGER" || editForm.role === "WORKER" ? editForm.marketId : null,
                    managedMarketId: editForm.role === "MARKET_MANAGER" ? editForm.marketId : null
                })
            });
            if (res.ok) {
                setSuccess("User updated successfully");
                setEditingUserId(null);
                fetchUsers();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to update user");
            }
        } catch (err) {
            setError("An error occurred while saving");
        }
    };
    const handleDeleteUser = async (userId, name)=>{
        if (!window.confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
            return;
        }
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setSuccess(`User "${name}" deleted`);
                setEditingUserId(null);
                fetchUsers();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to delete user");
            }
        } catch (err) {
            setError("An error occurred while deleting");
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].container,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].header,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "heading h2",
                        children: "User Management"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                        lineNumber: 295,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-secondary",
                        children: "Onboard team members and manage active accounts."
                    }, void 0, false, {
                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                        lineNumber: 296,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                lineNumber: 294,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-column gap-4",
                style: {
                    display: "flex",
                    flexDirection: "column"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "card glass animate-fade-in",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "heading h4",
                                children: "Invite Team Member"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                lineNumber: 302,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-secondary",
                                style: {
                                    fontSize: "0.875rem",
                                    marginBottom: "1.5rem"
                                },
                                children: "Send an onboarding link to a new Worker or Manager."
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                lineNumber: 303,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                onSubmit: handleSendInvite,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].formRow,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputGroup,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    children: "Email Address"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 309,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "email",
                                                    className: "input",
                                                    placeholder: "email@example.com",
                                                    value: inviteEmail,
                                                    onChange: (e)=>setInviteEmail(e.target.value),
                                                    required: true
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 310,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                            lineNumber: 308,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputGroup,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    children: "Role"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 320,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    className: "input",
                                                    value: inviteRole,
                                                    onChange: (e)=>setInviteRole(e.target.value),
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "WORKER",
                                                            children: "Worker"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                            lineNumber: 326,
                                                            columnNumber: 37
                                                        }, this),
                                                        currentUser?.role === "ADMIN" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "MARKET_MANAGER",
                                                                    children: "Market Manager"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                    lineNumber: 329,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: "ADMIN",
                                                                    children: "Admin"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                    lineNumber: 330,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 321,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                            lineNumber: 319,
                                            columnNumber: 29
                                        }, this),
                                        (inviteRole === "WORKER" || inviteRole === "MARKET_MANAGER") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputGroup,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    children: inviteRole === "WORKER" ? "Assigned Market" : "Managed Market"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 338,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    className: "input",
                                                    value: inviteMarketId,
                                                    onChange: (e)=>setInviteMarketId(e.target.value),
                                                    required: true,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "Select Market..."
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                            lineNumber: 345,
                                                            columnNumber: 41
                                                        }, this),
                                                        markets.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: m.id,
                                                                children: m.name
                                                            }, m.id, false, {
                                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                lineNumber: 347,
                                                                columnNumber: 45
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 339,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                            lineNumber: 337,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputGroup,
                                            style: {
                                                width: inviteRole === "WORKER" ? "120px" : "160px"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    children: inviteRole === "WORKER" ? "Pay/Hr" : "Monthly Salary"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 354,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    step: "0.01",
                                                    className: "input",
                                                    placeholder: inviteRole === "WORKER" ? "20.00" : "5000.00",
                                                    value: inviteHourlyWage,
                                                    onChange: (e)=>setInviteHourlyWage(e.target.value),
                                                    required: true
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 355,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                            lineNumber: 353,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            disabled: inviting,
                                            className: "btn btn-primary",
                                            style: {
                                                height: "42px"
                                            },
                                            children: inviting ? "Sending..." : "Create & Send Invite"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                            lineNumber: 366,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                    lineNumber: 307,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                lineNumber: 306,
                                columnNumber: 21
                            }, this),
                            inviteLink && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "card",
                                style: {
                                    marginTop: "1.5rem",
                                    background: "rgba(var(--primary-rgb), 0.1)",
                                    border: "1px solid var(--primary-light)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            fontSize: "0.75rem",
                                            fontWeight: "bold",
                                            marginBottom: "0.5rem"
                                        },
                                        children: "Registration Link:"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                        lineNumber: 374,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        style: {
                                            fontSize: "0.75rem",
                                            wordBreak: "break-all",
                                            display: "block"
                                        },
                                        children: inviteLink
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                        lineNumber: 375,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "btn btn-secondary btn-sm",
                                        style: {
                                            marginTop: "0.5rem",
                                            width: "100%"
                                        },
                                        onClick: ()=>{
                                            navigator.clipboard.writeText(inviteLink);
                                            setSuccess("Link copied to clipboard!");
                                        },
                                        children: "Copy Link"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                        lineNumber: 376,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                lineNumber: 373,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                        lineNumber: 301,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tableWrapper,
                        style: {
                            width: '100%',
                            overflowX: 'auto',
                            WebkitOverflowScrolling: 'touch'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].table,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "User"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                lineNumber: 396,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Role"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                lineNumber: 397,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Location/Scope"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                lineNumber: 398,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Pay Rate"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                lineNumber: 399,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Worked"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                lineNumber: 400,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Assigned"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                lineNumber: 401,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Reimb."
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                lineNumber: 402,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Pay for Cycle"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                lineNumber: 403,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Actions"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                lineNumber: 404,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                        lineNumber: 395,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                    lineNumber: 394,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            colSpan: 9,
                                            className: "text-center",
                                            style: {
                                                padding: "3rem"
                                            },
                                            children: "Loading team..."
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                            lineNumber: 409,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                        lineNumber: 409,
                                        columnNumber: 33
                                    }, this) : users.map((user)=>{
                                        const isEditing = editingUserId === user.id;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            className: "animate-fade-in",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].userInfo,
                                                        style: {
                                                            position: "relative"
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "0.5rem"
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                        children: user.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                        lineNumber: 418,
                                                                        columnNumber: 53
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        onClick: ()=>startEditing(user),
                                                                        className: "btn btn-ghost btn-sm",
                                                                        style: {
                                                                            padding: "2px",
                                                                            height: "auto"
                                                                        },
                                                                        title: "Edit User",
                                                                        children: "✎"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                        lineNumber: 419,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                lineNumber: 417,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: user.email
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                lineNumber: 429,
                                                                columnNumber: 49
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                        lineNumber: 416,
                                                        columnNumber: 45
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 415,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: isEditing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        className: "input input-sm",
                                                        value: editForm.role,
                                                        onChange: (e)=>setEditForm({
                                                                ...editForm,
                                                                role: e.target.value
                                                            }),
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "WORKER",
                                                                children: "Worker"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                lineNumber: 439,
                                                                columnNumber: 53
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "MARKET_MANAGER",
                                                                children: "Market Manager"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                lineNumber: 440,
                                                                columnNumber: 53
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "ADMIN",
                                                                children: "Admin"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                lineNumber: 441,
                                                                columnNumber: 53
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                        lineNumber: 434,
                                                        columnNumber: 49
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge",
                                                        children: user.role
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                        lineNumber: 444,
                                                        columnNumber: 49
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 432,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: isEditing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-column gap-1",
                                                        children: [
                                                            (editForm.role === "WORKER" || editForm.role === "MARKET_MANAGER") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                className: "input input-sm",
                                                                value: editForm.marketId,
                                                                onChange: (e)=>setEditForm({
                                                                        ...editForm,
                                                                        marketId: e.target.value
                                                                    }),
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "",
                                                                        children: "Select Market..."
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                        lineNumber: 456,
                                                                        columnNumber: 61
                                                                    }, this),
                                                                    markets.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                            value: m.id,
                                                                            children: m.name
                                                                        }, m.id, false, {
                                                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                            lineNumber: 458,
                                                                            columnNumber: 65
                                                                        }, this))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                lineNumber: 451,
                                                                columnNumber: 57
                                                            }, this),
                                                            editForm.role === "ADMIN" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-secondary",
                                                                style: {
                                                                    fontSize: "0.75rem"
                                                                },
                                                                children: "System Wide"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                lineNumber: 462,
                                                                columnNumber: 83
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                        lineNumber: 449,
                                                        columnNumber: 49
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-secondary",
                                                        style: {
                                                            fontSize: "0.875rem"
                                                        },
                                                        children: [
                                                            user.role === "ADMIN" && "System Wide",
                                                            (user.role === "MARKET_MANAGER" || user.role === "WORKER") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    "Market: ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                        children: user.managedMarket?.name || user.market?.name || 'Unassigned'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                        lineNumber: 468,
                                                                        columnNumber: 71
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                lineNumber: 468,
                                                                columnNumber: 57
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                        lineNumber: 465,
                                                        columnNumber: 49
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 447,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'right'
                                                    },
                                                    children: isEditing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        step: "0.01",
                                                        className: "input input-sm",
                                                        style: {
                                                            width: "80px",
                                                            textAlign: "right"
                                                        },
                                                        value: editForm.hourlyWage,
                                                        onChange: (e)=>setEditForm({
                                                                ...editForm,
                                                                hourlyWage: e.target.value
                                                            })
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                        lineNumber: 475,
                                                        columnNumber: 49
                                                    }, this) : user.hourlyWage ? `$${user.hourlyWage.toFixed(2)}${user.role === "WORKER" ? "/hr" : "/mo"}` : '-'
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 473,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'right',
                                                        fontWeight: 600
                                                    },
                                                    children: isEditing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        step: "0.1",
                                                        className: "input input-sm",
                                                        style: {
                                                            width: "60px",
                                                            textAlign: "right"
                                                        },
                                                        value: editForm.manualWorkedHours,
                                                        onChange: (e)=>setEditForm({
                                                                ...editForm,
                                                                manualWorkedHours: e.target.value
                                                            })
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                        lineNumber: 489,
                                                        columnNumber: 49
                                                    }, this) : user.role === "WORKER" ? `${user.workedHours}h` : 'N/A'
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 487,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'right',
                                                        fontWeight: 600
                                                    },
                                                    children: user.role === "WORKER" ? `${user.assignedHours}h` : 'N/A'
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 501,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'right',
                                                        fontWeight: 600
                                                    },
                                                    children: [
                                                        "$",
                                                        (user.totalReimbursement || 0).toFixed(2)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 504,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        textAlign: 'right',
                                                        color: "var(--success)",
                                                        fontWeight: 700
                                                    },
                                                    children: user.role === "WORKER" ? `$${(user.workedHours * (user.hourlyWage || 0) + (user.totalReimbursement || 0)).toFixed(2)}` : 'N/A'
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 507,
                                                    columnNumber: 1
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: "flex",
                                                            gap: "0.5rem"
                                                        },
                                                        children: isEditing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>handleSaveEdit(user.id),
                                                                    className: "btn btn-primary btn-sm",
                                                                    children: "Save"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                    lineNumber: 516,
                                                                    columnNumber: 57
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>handleDeleteUser(user.id, user.name),
                                                                    className: "btn btn-danger btn-sm",
                                                                    children: "Delete"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                    lineNumber: 523,
                                                                    columnNumber: 57
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: handleCancelEdit,
                                                                    className: "btn btn-secondary btn-sm",
                                                                    children: "Cancel"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                    lineNumber: 530,
                                                                    columnNumber: 57
                                                                }, this)
                                                            ]
                                                        }, void 0, true) : user.role === "WORKER" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>window.open(`/admin/users/${user.id}/assign`, '_blank'),
                                                                    className: "btn btn-primary btn-sm",
                                                                    children: "Add Job"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                    lineNumber: 541,
                                                                    columnNumber: 61
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$pdf$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateUserReportPDF"])(user),
                                                                    className: "btn btn-secondary btn-sm",
                                                                    children: "Report"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                    lineNumber: 548,
                                                                    columnNumber: 61
                                                                }, this)
                                                            ]
                                                        }, void 0, true)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                        lineNumber: 513,
                                                        columnNumber: 45
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 512,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, user.id, true, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                            lineNumber: 414,
                                            columnNumber: 37
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                    lineNumber: 407,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                            lineNumber: 393,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                        lineNumber: 392,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                lineNumber: 299,
                columnNumber: 13
            }, this),
            showJobModal && selectedUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].modalOverlay,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].modal} card glass animate-scale-in`,
                    style: {
                        maxWidth: "800px"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "1.5rem"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "heading h4",
                                    children: [
                                        "Weekly Schedule for ",
                                        selectedUser.name
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                    lineNumber: 574,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setShowJobModal(false),
                                    className: "btn btn-secondary btn-sm",
                                    children: "Close"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                    lineNumber: 575,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                            lineNumber: 573,
                            columnNumber: 29
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleQuickJobSubmit,
                            className: "flex-column gap-3",
                            style: {
                                display: "flex"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].scheduleGridHeader,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Day"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                            lineNumber: 580,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Hours"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                            lineNumber: 581,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Location (Store)"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                            lineNumber: 582,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                    lineNumber: 579,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].scheduleRows,
                                    children: weekSchedule.map((dayData, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].scheduleRow} ${dayData.enabled ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].rowActive : ""}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].dayLabel,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            checked: dayData.enabled,
                                                            onChange: (e)=>{
                                                                const newSchedule = [
                                                                    ...weekSchedule
                                                                ];
                                                                newSchedule[index].enabled = e.target.checked;
                                                                setWeekSchedule(newSchedule);
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                            lineNumber: 589,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            children: dayData.day
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                            lineNumber: 598,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 588,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].timeInputs,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "time",
                                                            className: "input input-sm",
                                                            value: dayData.startTime,
                                                            disabled: !dayData.enabled,
                                                            onChange: (e)=>{
                                                                const newSchedule = [
                                                                    ...weekSchedule
                                                                ];
                                                                newSchedule[index].startTime = e.target.value;
                                                                setWeekSchedule(newSchedule);
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                            lineNumber: 602,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "to"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                            lineNumber: 613,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "time",
                                                            className: "input input-sm",
                                                            value: dayData.endTime,
                                                            disabled: !dayData.enabled,
                                                            onChange: (e)=>{
                                                                const newSchedule = [
                                                                    ...weekSchedule
                                                                ];
                                                                newSchedule[index].endTime = e.target.value;
                                                                setWeekSchedule(newSchedule);
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                            lineNumber: 614,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 601,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$app$2f$admin$2f$users$2f$users$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].storeSelect,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        className: "input input-sm",
                                                        value: dayData.storeId,
                                                        disabled: !dayData.enabled,
                                                        onChange: (e)=>{
                                                            const newSchedule = [
                                                                ...weekSchedule
                                                            ];
                                                            newSchedule[index].storeId = e.target.value;
                                                            setWeekSchedule(newSchedule);
                                                        },
                                                        required: dayData.enabled,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "",
                                                                children: "Select Store..."
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                lineNumber: 639,
                                                                columnNumber: 53
                                                            }, this),
                                                            stores.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: s.id,
                                                                    children: s.name
                                                                }, s.id, false, {
                                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                                    lineNumber: 640,
                                                                    columnNumber: 70
                                                                }, this))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                        lineNumber: 628,
                                                        columnNumber: 49
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                                    lineNumber: 627,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, dayData.day, true, {
                                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                            lineNumber: 587,
                                            columnNumber: 41
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                    lineNumber: 585,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: "flex",
                                        gap: "1rem",
                                        marginTop: "1rem",
                                        paddingTop: "1rem",
                                        borderTop: "1px solid var(--card-border)"
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        className: "btn btn-primary",
                                        style: {
                                            flex: 1
                                        },
                                        children: "Publish Weekly Schedule"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                        lineNumber: 648,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                                    lineNumber: 647,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                            lineNumber: 578,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                    lineNumber: 572,
                    columnNumber: 25
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                lineNumber: 571,
                columnNumber: 21
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "alert alert-danger fixed-toast animate-fade-in",
                children: error
            }, void 0, false, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                lineNumber: 658,
                columnNumber: 23
            }, this),
            success && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "alert alert-success fixed-toast animate-fade-in",
                children: success
            }, void 0, false, {
                fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
                lineNumber: 659,
                columnNumber: 25
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/clock in:out/apps/web/src/app/admin/users/page.tsx",
        lineNumber: 293,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__68e32511._.js.map