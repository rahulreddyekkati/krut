/**
 * End-to-end check of JobAssignment.assignedById against a SCRATCH SQLite database.
 * Calls every route that creates an assignment or changes its worker, as an admin, a
 * market manager and a worker, and asserts who ends up recorded as the assigner, that
 * each hand-over writes exactly one audit row, and what the dashboard reports.
 *
 * Several of these routes read the session through next/headers, so this talks to a
 * running dev server over HTTP instead of importing the handlers. Both must point at the same
 * scratch file and share JWT_SECRET / CRON_SECRET. From apps/web:
 *
 *   export DB=/abs/path/test.db JWT_SECRET=assigned-by-e2e CRON_SECRET=assigned-by-e2e-cron
 *   export TURSO_DATABASE_URL="" ORIGINAL_DATABASE_URL="" DATABASE_URL="file:$DB" SMTP_HOST=""
 *   ../../node_modules/.bin/prisma db push --schema ../../prisma/schema.prisma --skip-generate
 *   npx next dev -p 3999 &
 *   BASE_URL=http://localhost:3999 npx tsx --tsconfig tsconfig.json scripts/assigned-by-e2e.ts
 *
 * Refuses to run against anything but an empty local file database. The clock-in steps
 * build a shift around the current time, so they can fail within ~2h of midnight Central.
 */
if (process.env.TURSO_DATABASE_URL || process.env.ORIGINAL_DATABASE_URL || !process.env.DATABASE_URL?.startsWith("file:")) {
    console.error("Refusing to run: needs TURSO_DATABASE_URL=\"\" ORIGINAL_DATABASE_URL=\"\" and DATABASE_URL=file:/…");
    process.exit(2);
}
if (!process.env.JWT_SECRET || !process.env.CRON_SECRET || !process.env.BASE_URL) {
    console.error("Refusing to run: JWT_SECRET, CRON_SECRET and BASE_URL must be set (same secrets as the dev server).");
    process.exit(2);
}
const BASE_URL = process.env.BASE_URL;
const STORE_TZ = "America/Chicago";

let failures = 0;
const check = (label: string, actual: unknown, expected: unknown) => {
    const ok = actual === expected;
    if (!ok) failures++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n        expected ${expected}\n        actual   ${actual}`}`);
};

async function main() {
    const { default: prisma } = await import("@/lib/prisma");
    const { encrypt } = await import("@/lib/session");
    const { getPreviousCycleDates } = await import("@/lib/cycles");

    if ((await prisma.user.count()) !== 0) {
        console.error("Refusing to run: the database is not empty. Use a fresh scratch file.");
        process.exit(2);
    }

    type U = { id: string; email: string; name: string; role: string };
    const call = async (user: U | null, method: string, url: string, body?: unknown, headers: Record<string, string> = {}) => {
        const token = user ? await encrypt({ user: { id: user.id, email: user.email, name: user.name, role: user.role } }) : null;
        const res = await fetch(`${BASE_URL}${url}`, {
            method,
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), "Content-Type": "application/json", ...headers },
            ...(body ? { body: JSON.stringify(body) } : {}),
        });
        let json: any = null;
        try { json = await res.json(); } catch { /* empty body */ }
        return { status: res.status, json };
    };

    // ── Fixtures ───────────────────────────────────────────────────────────────────
    const market = await prisma.market.create({ data: { name: "E2E Market", timezone: STORE_TZ } });
    const store = await prisma.store.create({
        data: { name: "E2E Store", address: "1 Main St", latitude: 30, longitude: -97, radius: 100, timezone: STORE_TZ, marketId: market.id },
    });
    const mkUser = (name: string, role: string, extra: Record<string, unknown> = {}) =>
        prisma.user.create({ data: { email: `${name.toLowerCase().replace(/\s+/g, ".")}@test.invalid`, password: "x", name, role, status: "ACTIVE", ...extra } });
    const admin = await mkUser("E2E Admin", "ADMIN");
    const ghost = await mkUser("Ghost Admin", "ADMIN");
    const manager = await mkUser("E2E Manager", "MARKET_MANAGER", { managedMarketId: market.id });
    const workers: U[] = [];
    for (let i = 1; i <= 8; i++) workers.push(await mkUser(`Worker ${i}`, "WORKER", { marketId: market.id }));
    const [w1, w2, w3, w4, w5, w6, w7, w8] = workers;
    const workerIds = new Set(workers.map(w => w.id));

    const localParts = (d: Date) => {
        const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
            timeZone: STORE_TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
        }).formatToParts(d).map(x => [x.type, x.value]));
        return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
    };
    const todayStr = localParts(new Date()).date;
    const todayMarker = new Date(`${todayStr}T00:00:00.000Z`);
    const dayStr = (offset: number) => new Date(todayMarker.getTime() + offset * 86400000).toISOString().slice(0, 10);
    const marker = (offset: number) => new Date(`${dayStr(offset)}T00:00:00.000Z`);
    const startNow = localParts(new Date(Date.now() - 10 * 60000)).time;
    const endNow = localParts(new Date(Date.now() + 120 * 60000)).time;

    let n = 0;
    const mkJob = (opts: { date?: Date | null; status?: string; start?: string; end?: string } = {}) =>
        prisma.job.create({
            data: {
                title: `E2E job ${++n}`, startTimeStr: opts.start ?? "09:00", endTimeStr: opts.end ?? "17:00",
                date: opts.date ?? null, status: opts.status ?? "ASSIGNED", storeId: store.id, marketId: market.id, creatorId: admin.id,
            },
        });
    const reload = (id: string) => prisma.jobAssignment.findUniqueOrThrow({ where: { id } });
    const audits = async (entityId: string, action: string) =>
        (await prisma.auditLog.findMany({ where: { entityId, action } })).map(a => ({
            actorId: a.actorId, old: JSON.parse(a.oldValue || "{}"), new: JSON.parse(a.newValue || "{}"),
        }));
    // Worker asks to release, admin approves: the row ends up AVAILABLE.
    const release = async (worker: U, assignmentId: string, approver: U) => {
        await call(worker, "POST", "/api/jobs/actions", { action: "RELEASE", assignmentId, reason: "e2e" });
        const rr = await prisma.releaseRequest.findFirstOrThrow({ where: { assignmentId, status: "PENDING" } });
        return call(approver, "POST", `/api/admin/shift-release-requests/${rr.id}/approve`);
    };
    // Worker asks for an AVAILABLE row (or an OPEN job), admin approves.
    const claim = async (worker: U, target: { assignmentId?: string; jobId?: string }, approver: U) => {
        await call(worker, "POST", "/api/jobs/actions", { action: "ACCEPT", ...target });
        const sr = await prisma.shiftRequest.findFirstOrThrow({ where: { workerId: worker.id, status: "PENDING", ...(target.assignmentId ? { assignmentId: target.assignmentId } : { jobId: target.jobId }) } });
        return call(approver, "POST", `/api/admin/shift-assign-requests/${sr.id}/approve`);
    };

    // ── A2. Single-date assign (market manager) ────────────────────────────────────
    const jobA = await mkJob();
    let res = await call(manager, "POST", `/api/users/${w1.id}/assignments`, { jobId: jobA.id, date: dayStr(7) });
    const single = res.json?.created?.[0];
    check(`A2 single-date assign by manager (HTTP ${res.status})`, single?.assignedById, manager.id);

    // ── A1. Recurring assign (admin) ───────────────────────────────────────────────
    const jobB = await mkJob();
    res = await call(admin, "POST", `/api/users/${w1.id}/assignments`, { jobId: jobB.id, weekdays: [0, 1, 2, 3, 4, 5, 6] });
    const recurring: any[] = res.json?.created ?? [];
    check(`A1 recurring assign created rows (HTTP ${res.status})`, recurring.length > 3, true);
    check("A1 every recurring row is stamped with the admin", recurring.every(r => r.assignedById === admin.id), true);
    const future = recurring.filter(r => r.date.slice(0, 10) >= dayStr(2));

    // ── A3. Assign an open job from Released Shifts (admin) ────────────────────────
    const jobC = await mkJob({ status: "OPEN", date: marker(8) });
    res = await call(admin, "POST", "/api/admin/released-shifts/assign", { openJobId: jobC.id, workerId: w2.id, date: dayStr(8) });
    const openAssigned = await prisma.jobAssignment.findFirstOrThrow({ where: { jobId: jobC.id } });
    check(`A3 released-shifts assign by admin (HTTP ${res.status})`, openAssigned.assignedById, admin.id);

    // ── B4. Release clears the assigner and logs who it was ────────────────────────
    res = await release(w1, single.id, admin);
    let row = await reload(single.id);
    check(`B4 released row is AVAILABLE (HTTP ${res.status})`, row.status, "AVAILABLE");
    check("B4 released row has no assigner", row.assignedById, null);
    let log = await audits(single.id, "SHIFT_RELEASED");
    check("B4 exactly one SHIFT_RELEASED audit row", log.length, 1);
    check("B4 audit keeps the previous assigner", log[0]?.old.assignedById, manager.id);
    check("B4 audit actor is the approving admin", log[0]?.actorId, admin.id);

    // ── B2. Approving a worker's request stamps the approver ───────────────────────
    res = await claim(w2, { assignmentId: single.id }, manager);
    row = await reload(single.id);
    check(`B2 approved request moves the shift to the requester (HTTP ${res.status})`, row.workerId, w2.id);
    check("B2 approver is the assigner", row.assignedById, manager.id);
    log = await audits(single.id, "SHIFT_REASSIGNED");
    check("B2 exactly one SHIFT_REASSIGNED audit row", log.length, 1);
    check("B2 audit old worker", log[0]?.old.workerId, w1.id);
    check("B2 audit new assigner", log[0]?.new.assignedById, manager.id);

    // ── B3. Edit Shift modal: change the worker ────────────────────────────────────
    res = await call(manager, "PATCH", `/api/admin/assignments/${openAssigned.id}`, { newWorkerId: w3.id });
    row = await reload(openAssigned.id);
    check(`B3 reassign moves the shift (HTTP ${res.status})`, row.workerId, w3.id);
    check("B3 reassigning manager is the assigner", row.assignedById, manager.id);
    log = await audits(openAssigned.id, "SHIFT_REASSIGNED");
    check("B3 exactly one SHIFT_REASSIGNED audit row", log.length, 1);
    check("B3 audit keeps the previous assigner", log[0]?.old.assignedById, admin.id);
    check("B3 audit new assigner", log[0]?.new.assignedById, manager.id);
    res = await call(admin, "PATCH", `/api/admin/assignments/${openAssigned.id}`, { brandAllocation: "KRUTO" });
    row = await reload(openAssigned.id);
    check(`B3 brand-only edit by someone else leaves the assigner alone (HTTP ${res.status})`, row.assignedById, manager.id);
    check("B3 brand-only edit writes no audit row", (await audits(openAssigned.id, "SHIFT_REASSIGNED")).length, 1);

    // ── B1. Direct-assign a released shift ─────────────────────────────────────────
    await release(w1, future[0].id, admin);
    res = await call(manager, "PATCH", `/api/users/${w2.id}/assignments`, { assignmentId: future[0].id, directAssign: true, newWorkerId: w2.id });
    row = await reload(future[0].id);
    check(`B1 direct-assign moves the shift (HTTP ${res.status})`, row.workerId, w2.id);
    check("B1 direct-assigning manager is the assigner", row.assignedById, manager.id);
    log = await audits(future[0].id, "SHIFT_REASSIGNED");
    check("B1 exactly one SHIFT_REASSIGNED audit row", log.length, 1);
    check("B1 audit old state is the released row", `${log[0]?.old.workerId}/${log[0]?.old.assignedById}/${log[0]?.old.status}`, `${w1.id}/null/AVAILABLE`);

    // ── B1 atomicity: a failed audit insert rolls the worker change back ───────────
    // The ghost admin's token is still valid but their user row is gone, so the audit
    // row's actor foreign key fails inside the transaction.
    await release(w1, future[1].id, admin);
    await prisma.user.delete({ where: { id: ghost.id } });
    res = await call(ghost, "PATCH", `/api/users/${w2.id}/assignments`, { assignmentId: future[1].id, directAssign: true, newWorkerId: w2.id });
    row = await reload(future[1].id);
    check("atomicity: request with a failing audit insert is rejected", res.status >= 500, true);
    check("atomicity: worker change rolled back", `${row.workerId}/${row.status}/${row.assignedById}`, `${w1.id}/AVAILABLE/null`);
    check("atomicity: no audit row written", (await audits(future[1].id, "SHIFT_REASSIGNED")).length, 0);

    // ── B5. Inviting a worker to an AVAILABLE row is not an assignment ─────────────
    res = await call(admin, "POST", "/api/admin/jobs/by-date/request", {
        workerId: w3.id, items: [{ jobId: jobB.id, date: future[1].date.slice(0, 10), assignmentId: future[1].id }],
    });
    row = await reload(future[1].id);
    check(`B5 invite on an existing row targets the worker (HTTP ${res.status})`, row.requestedWorkerId, w3.id);
    check("B5 invite leaves worker and assigner untouched", `${row.workerId}/${row.assignedById}`, `${w1.id}/null`);

    // ── A5. An invite row is created unassigned; approval stamps it ────────────────
    const jobD = await mkJob({ date: marker(9) });
    res = await call(admin, "POST", "/api/admin/jobs/by-date/request", { workerId: w3.id, items: [{ jobId: jobD.id, date: dayStr(9) }] });
    const invite = await prisma.jobAssignment.findFirstOrThrow({ where: { jobId: jobD.id } });
    check(`A5 invite row is AVAILABLE with no assigner (HTTP ${res.status})`, `${invite.status}/${invite.assignedById}`, "AVAILABLE/null");
    await claim(w3, { assignmentId: invite.id }, manager);
    check("A5 approving the invited worker's request stamps the approver", (await reload(invite.id)).assignedById, manager.id);

    // ── A4. Legacy flow: request an OPEN job, approval creates the row ─────────────
    const jobE = await mkJob({ status: "OPEN", date: marker(10) });
    res = await claim(w3, { jobId: jobE.id }, admin);
    const legacy = await prisma.jobAssignment.findFirst({ where: { jobId: jobE.id } });
    check(`A4 legacy approval creates a row stamped with the approver (HTTP ${res.status})`, legacy?.assignedById, admin.id);

    // ── A7 / A8. Clock-in materialization runs as the worker but copies the template ─
    const template = async (worker: U, assignedById: string | null) => {
        const job = await mkJob({ start: startNow, end: endNow });
        const t = await prisma.jobAssignment.create({ data: { jobId: job.id, workerId: worker.id, isRecurring: true, date: null, assignedById } });
        return { job, t };
    };
    const gps = { latitude: 30, longitude: -97 };
    const materialized = (jobId: string, workerId: string) =>
        prisma.jobAssignment.findFirst({ where: { jobId, workerId, date: { not: null } } });

    const t8 = await template(w4, admin.id);
    res = await call(w4, "POST", `/api/jobs/${t8.job.id}/clock-in`, gps, { "x-app-client": "mobile-app" });
    let inst = await materialized(t8.job.id, w4.id);
    check(`A8 /jobs/[id]/clock-in materialized a row (HTTP ${res.status})`, !!inst?.clockIn, true);
    check("A8 instance carries the admin who set the shift up, not the worker", inst?.assignedById, admin.id);

    const t7 = await template(w5, manager.id);
    res = await call(w5, "POST", "/api/timeclock", { action: "CLOCK_IN", assignmentId: t7.t.id, ...gps });
    inst = await materialized(t7.job.id, w5.id);
    check(`A7 /timeclock materialized a row (HTTP ${res.status})`, !!inst?.clockIn, true);
    check("A7 instance carries the manager who set the shift up, not the worker", inst?.assignedById, manager.id);

    const t0 = await template(w6, null);
    res = await call(w6, "POST", "/api/timeclock", { action: "CLOCK_IN", assignmentId: t0.t.id, ...gps });
    inst = await materialized(t0.job.id, w6.id);
    check(`A7 pre-feature template materialized a row (HTTP ${res.status})`, !!inst?.clockIn, true);
    check("A7 pre-feature template stays unrecorded (not the worker's id)", inst?.assignedById, null);

    // ── A6. Rollover copies the pattern's assigner ─────────────────────────────────
    const prev = getPreviousCycleDates();
    const pattern = async (worker: U, assignedById: string | null) => {
        const job = await mkJob();
        for (let i = 0; i < 7; i++) {
            const d = new Date(prev.start.getTime() + i * 86400000);
            await prisma.jobAssignment.create({ data: { jobId: job.id, workerId: worker.id, date: d, isRecurring: true, dayOfWeek: d.getUTCDay(), status: "COMPLETED", assignedById } });
        }
        return job;
    };
    const rolled = (jobId: string) => prisma.jobAssignment.findMany({ where: { jobId, date: { gte: todayMarker } } });

    const jobStamped = await pattern(w7, manager.id);
    const jobLegacy = await pattern(w7, null);
    res = await call(admin, "GET", `/api/users/${w7.id}/assignments`);
    let rows = await rolled(jobStamped.id);
    check(`A6 rollover on admin load generated rows (HTTP ${res.status})`, rows.length > 0, true);
    check("A6 rolled-over rows keep the pattern's assigner (not the admin who loaded the page)", rows.every(r => r.assignedById === manager.id), true);
    rows = await rolled(jobLegacy.id);
    check("A6 pre-feature pattern rolls over unrecorded", rows.length > 0 && rows.every(r => r.assignedById === null), true);

    const jobCron = await pattern(w8, admin.id);
    res = await call(null, "GET", "/api/cron/cycle-rollover", undefined, { Authorization: `Bearer ${process.env.CRON_SECRET}` });
    rows = await rolled(jobCron.id);
    check(`A6 rollover from cron (no session) generated rows (HTTP ${res.status})`, rows.length > 0, true);
    check("A6 cron rows keep the pattern's assigner", rows.every(r => r.assignedById === admin.id), true);

    // ── Dashboard ──────────────────────────────────────────────────────────────────
    // Point one row at the deleted ghost admin: an id that no longer resolves.
    await prisma.jobAssignment.update({ where: { id: legacy!.id }, data: { assignedById: ghost.id } });
    res = await call(admin, "GET", "/api/admin/dashboard-details?type=jobs");
    const byAssignment = new Map<string, any>((res.json?.data ?? []).map((r: any) => [r.assignmentId, r]));
    check(`dashboard shows the assigner's name (HTTP ${res.status})`, byAssignment.get(invite.id)?.assignedByName, "E2E Manager");
    check("dashboard shows nothing for an AVAILABLE shift", byAssignment.get(future[1].id)?.assignedByName, null);
    check("dashboard flags an assigner whose account was deleted", byAssignment.get(legacy!.id)?.assignedByName, "Deleted user");

    // ── Invariants over everything the run produced ────────────────────────────────
    const all = await prisma.jobAssignment.findMany({ select: { status: true, assignedById: true } });
    check("no assignment anywhere records a worker as the assigner", all.some(a => a.assignedById && workerIds.has(a.assignedById)), false);
    check("no AVAILABLE assignment has an assigner", all.some(a => a.status === "AVAILABLE" && a.assignedById), false);

    console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) FAILED.`);
    process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });

// Makes this file a module, so its top-level names don't collide with other scripts.
export {};
