module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

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
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/Desktop/clock in:out/apps/web/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/Desktop/clock in:out/node_modules/@prisma/client)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$adapter$2d$libsql$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/@prisma/adapter-libsql/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$libsql$2f$client__$5b$external$5d$__$2840$libsql$2f$client$2c$__esm_import$2c$__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$29$__ = __turbopack_context__.i("[externals]/@libsql/client [external] (@libsql/client, esm_import, [project]/Desktop/clock in:out/node_modules/@libsql/client)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$libsql$2f$client__$5b$external$5d$__$2840$libsql$2f$client$2c$__esm_import$2c$__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$libsql$2f$client__$5b$external$5d$__$2840$libsql$2f$client$2c$__esm_import$2c$__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const prismaClientSingleton = ()=>{
    const url = process.env.DATABASE_URL || "file:./dev.db";
    if (url.startsWith("libsql://") || url.startsWith("https://")) {
        const libsql = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$libsql$2f$client__$5b$external$5d$__$2840$libsql$2f$client$2c$__esm_import$2c$__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$libsql$2f$client$29$__["createClient"])({
            url,
            authToken: process.env.TURSO_AUTH_TOKEN
        });
        const adapter = new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$adapter$2d$libsql$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PrismaLibSQL"](libsql);
        return new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
            adapter
        });
    }
    // Fallback to native for local SQLite
    return new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]();
};
const prisma = globalThis.prisma ?? prismaClientSingleton();
const __TURBOPACK__default__export__ = prisma;
if ("TURBOPACK compile-time truthy", 1) globalThis.prisma = prisma;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Desktop/clock in:out/apps/web/src/lib/apiError.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppError",
    ()=>AppError,
    "handleApiError",
    ()=>handleApiError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/zod/v4/classic/errors.js [app-route] (ecmascript)");
;
;
function handleApiError(error) {
    // Zod validation errors → 400 with field-level details (safe to expose)
    if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZodError"]) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Validation failed",
            issues: error.issues.map((i)=>({
                    field: i.path.join("."),
                    message: i.message
                }))
        }, {
            status: 400
        });
    }
    // Known application errors (thrown with a status code attached)
    if (error instanceof AppError) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: error.status
        });
    }
    // Unknown / unexpected errors — log full details server-side only
    const errorId = crypto.randomUUID();
    console.error(`[ERROR ${errorId}]`, error);
    // Prisma unique constraint → 409
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "A record with this value already exists.",
            errorId
        }, {
            status: 409
        });
    }
    // Prisma foreign key constraint
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2003") {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Referenced record does not exist.",
            errorId
        }, {
            status: 400
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Internal server error",
        errorId
    }, {
        status: 500
    });
}
class AppError extends Error {
    status;
    constructor(message, status = 400){
        super(message), this.status = status;
        this.name = "AppError";
    }
}
}),
"[project]/Desktop/clock in:out/apps/web/src/lib/session.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decrypt",
    ()=>decrypt,
    "encrypt",
    ()=>encrypt
]);
// Edge-runtime-safe JWT helpers — no Prisma, no Node.js-only imports.
// Used by middleware (Edge) and re-exported by auth.ts (Node).
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/jwt/sign.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/node_modules/jose/dist/webapi/jwt/verify.js [app-route] (ecmascript)");
;
const getKey = ()=>new TextEncoder().encode(process.env.JWT_SECRET ?? "");
async function encrypt(payload) {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SignJWT"](payload).setProtectedHeader({
        alg: "HS256"
    }).setIssuedAt().setExpirationTime("24h").sign(getKey());
}
async function decrypt(input) {
    const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jwtVerify"])(input, getKey(), {
        algorithms: [
            "HS256"
        ]
    });
    return payload;
}
}),
"[project]/Desktop/clock in:out/apps/web/src/lib/auth.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getSession",
    ()=>getSession,
    "requireAuth",
    ()=>requireAuth,
    "updateSession",
    ()=>updateSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$apiError$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/src/lib/apiError.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/src/lib/session.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
// ─── Startup guard ────────────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
    throw new Error("FATAL: JWT_SECRET environment variable is not set. " + "Set it in .env before starting the server.");
}
async function getSession() {
    const cookiesList = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const headersList = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["headers"])();
    let session = cookiesList.get("session")?.value;
    if (!session) {
        const authHeader = headersList.get("Authorization");
        if (authHeader?.startsWith("Bearer ")) {
            session = authHeader.substring(7);
        }
    }
    if (!session) return null;
    try {
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decrypt"])(session);
    } catch  {
        return null;
    }
}
async function updateSession(request) {
    const session = request.cookies.get("session")?.value;
    if (!session) return;
    const parsed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decrypt"])(session);
    parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const res = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].next();
    res.cookies.set({
        name: "session",
        value: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encrypt"])(parsed),
        httpOnly: true,
        expires: parsed.expires
    });
    return res;
}
async function requireAuth(request, allowedRoles) {
    // 1. Extract token
    let token;
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
    } else {
        token = request.cookies.get("session")?.value;
    }
    if (!token) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$apiError$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"]("Unauthorized", 401);
    }
    // 2. Verify JWT signature
    let jwtPayload;
    try {
        jwtPayload = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decrypt"])(token);
    } catch  {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$apiError$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"]("Unauthorized — invalid or expired token", 401);
    }
    const userId = jwtPayload?.user?.id;
    if (!userId) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$apiError$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"]("Unauthorized — malformed token", 401);
    }
    // 3. Re-fetch user from DB (CRIT-02 fix — role/status always from DB, never JWT)
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            marketId: true,
            managedMarketId: true,
            hourlyWage: true
        }
    });
    if (!user) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$apiError$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"]("Unauthorized — user not found", 401);
    }
    // 4. Block inactive users
    if (user.status === "SUSPENDED" || user.status === "DEACTIVATED") {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$apiError$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"]("Account is inactive", 403);
    }
    // 5. Role check
    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$apiError$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AppError"]("Forbidden — insufficient permissions", 403);
        }
    }
    return user;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Desktop/clock in:out/apps/web/src/lib/cycles.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getClosedCycles",
    ()=>getClosedCycles,
    "getCurrentCycleDates",
    ()=>getCurrentCycleDates,
    "getCycleDisplayName",
    ()=>getCycleDisplayName,
    "getPreviousCycleDates",
    ()=>getPreviousCycleDates
]);
function getCurrentCycleDates(baseDate = new Date()) {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const day = baseDate.getDate();
    if (day <= 15) {
        const start = new Date(year, month, 1, 0, 0, 0, 0);
        const end = new Date(year, month, 15, 23, 59, 59, 999);
        return {
            start,
            end
        };
    } else {
        const start = new Date(year, month, 16, 0, 0, 0, 0);
        const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
        return {
            start,
            end
        };
    }
}
function getPreviousCycleDates(baseDate = new Date()) {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const day = baseDate.getDate();
    if (day <= 15) {
        // Previous was 16th to end of month before
        const prevMonthEnd = new Date(year, month, 0);
        const start = new Date(year, month - 1, 16, 0, 0, 0, 0);
        const end = new Date(year, month - 1, prevMonthEnd.getDate(), 23, 59, 59, 999);
        return {
            start,
            end
        };
    } else {
        // Previous was 1st to 15th of current month
        const start = new Date(year, month, 1, 0, 0, 0, 0);
        const end = new Date(year, month, 15, 23, 59, 59, 999);
        return {
            start,
            end
        };
    }
}
function getClosedCycles(count = 6) {
    const cycles = [];
    let currentBase = new Date();
    // Start from the most recent closed cycle
    // If today is 16th+, the 1-15 cycle is closed.
    // If today is 1-15, the 16-31 of prev month is closed.
    for(let i = 0; i < count; i++){
        const prev = getPreviousCycleDates(currentBase);
        cycles.push({
            ...prev,
            label: getCycleDisplayName(prev) + ` (${prev.start.getFullYear()})`
        });
        // Move currentBase back to before the start of this cycle to get the next previous
        currentBase = new Date(prev.start.getTime() - 1000);
    }
    return cycles;
}
function getCycleDisplayName(dates) {
    const options = {
        month: 'short',
        day: 'numeric'
    };
    return `${dates.start.toLocaleDateString(undefined, options)} - ${dates.end.toLocaleDateString(undefined, options)}`;
}
}),
"[project]/Desktop/clock in:out/apps/web/src/app/api/users/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/src/lib/auth.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$cycles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/clock in:out/apps/web/src/lib/cycles.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function GET() {
    try {
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSession"])();
        if (!session) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Unauthorized"
            }, {
                status: 401
            });
        }
        const requester = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].user.findUnique({
            where: {
                id: session.user.id
            }
        });
        if (!requester || requester.role !== "ADMIN" && requester.role !== "MARKET_MANAGER") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Unauthorized"
            }, {
                status: 401
            });
        }
        const where = {};
        if (requester.role === "MARKET_MANAGER") {
            where.marketId = requester.managedMarketId;
            where.role = {
                not: "ADMIN"
            };
        }
        const { start: cycleStart, end: cycleEnd } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$cycles$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCurrentCycleDates"])();
        const users = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].user.findMany({
            where,
            include: {
                _count: {
                    select: {
                        jobs: true,
                        createdJobs: true,
                        sentInvites: true
                    }
                },
                market: {
                    select: {
                        name: true
                    }
                },
                managedMarket: {
                    select: {
                        name: true
                    }
                },
                jobs: {
                    where: {
                        OR: [
                            // Dated shifts within the cycle
                            {
                                date: {
                                    gte: cycleStart,
                                    lte: cycleEnd
                                }
                            },
                            // Already worked shifts within the cycle
                            {
                                clockIn: {
                                    gte: cycleStart,
                                    lte: cycleEnd
                                }
                            },
                            // Recurring shifts (no fixed date) that haven't been worked yet
                            {
                                AND: [
                                    {
                                        date: null
                                    },
                                    {
                                        clockIn: null
                                    },
                                    {
                                        dayOfWeek: {
                                            not: null
                                        }
                                    } // Ignore malformed shifts missing a day
                                ]
                            }
                        ]
                    },
                    include: {
                        job: true,
                        recap: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        // Helper: calculate base hours for a user
        const calcHours = (user)=>{
            let assignedHours = 0;
            let workedHours = 0;
            let totalReimbursement = 0;
            const seenJobRecaps = new Set();
            user.jobs.forEach((assignment)=>{
                const job = assignment.job;
                if (job && job.startTimeStr && job.endTimeStr) {
                    const [sh, sm] = job.startTimeStr.split(":").map(Number);
                    const [eh, em] = job.endTimeStr.split(":").map(Number);
                    let durationMins = eh * 60 + em - (sh * 60 + sm);
                    if (durationMins < 0) durationMins += 24 * 60;
                    const duration = durationMins / 60;
                    assignedHours += duration;
                    if (typeof assignment.workedHours === 'number') {
                        workedHours += assignment.workedHours;
                    } else if (assignment.clockIn && assignment.clockOut) {
                        const cIn = new Date(assignment.clockIn);
                        const cOut = new Date(assignment.clockOut);
                        if (!isNaN(cIn.getTime()) && !isNaN(cOut.getTime())) {
                            const breakMinutes = assignment.breakTimeMinutes || 0;
                            const diffMins = (cOut.getTime() - cIn.getTime()) / 60000;
                            workedHours += Math.max(0, (diffMins - breakMinutes) / 60);
                        }
                    }
                    if (assignment.recap?.reimbursement && assignment.recap?.status === "APPROVED") {
                        totalReimbursement += assignment.recap.reimbursement;
                    }
                }
            });
            return {
                assignedHours,
                workedHours,
                totalReimbursement
            };
        };
        // Fetch approved releases this week to subtract from assignedHours
        const approvedReleases = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].releaseRequest.findMany({
            where: {
                status: "APPROVED",
                date: {
                    gte: cycleStart,
                    lte: cycleEnd
                }
            },
            include: {
                job: {
                    select: {
                        startTimeStr: true,
                        endTimeStr: true
                    }
                }
            }
        });
        const releasesByWorker = {};
        for (const rel of approvedReleases){
            if (!releasesByWorker[rel.workerId]) releasesByWorker[rel.workerId] = [];
            releasesByWorker[rel.workerId].push(rel);
        }
        const usersWithHours = users.map((user)=>{
            let { assignedHours, workedHours, totalReimbursement } = calcHours(user);
            // Subtract released shift hours
            const userReleases = releasesByWorker[user.id] || [];
            for (const rel of userReleases){
                if (rel.job.startTimeStr && rel.job.endTimeStr) {
                    const [sh, sm] = rel.job.startTimeStr.split(":").map(Number);
                    const [eh, em] = rel.job.endTimeStr.split(":").map(Number);
                    let durationMins = eh * 60 + em - (sh * 60 + sm);
                    if (durationMins < 0) durationMins += 24 * 60;
                    assignedHours -= durationMins / 60;
                }
            }
            if (assignedHours < 0) assignedHours = 0;
            const { jobs, ...userData } = user;
            const finalWorkedHours = user.manualWorkedHours !== null && user.manualWorkedHours !== undefined ? user.manualWorkedHours : parseFloat(workedHours.toFixed(2));
            return {
                ...userData,
                assignedHours: parseFloat(assignedHours.toFixed(2)),
                workedHours: finalWorkedHours,
                totalReimbursement: parseFloat(totalReimbursement.toFixed(2))
            };
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(usersWithHours);
    } catch (error) {
        console.error("DEBUG: GET Users error full details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$clock__in$3a$out$2f$apps$2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error",
            details: error.message
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b6bc3c99._.js.map