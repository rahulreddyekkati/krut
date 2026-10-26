import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";

// DB-backed scenarios for account deactivation. They need a throwaway SQLite file and are
// skipped otherwise, because the repo's .env points Prisma at the hosted Turso database:
//
//   DB=/abs/path/deactivation-test.db
//   TURSO_DATABASE_URL="" ORIGINAL_DATABASE_URL="" DATABASE_URL="file:$DB" \
//     node_modules/.bin/prisma db push --schema prisma/schema.prisma --skip-generate
//   cd apps/web && DEACTIVATION_TEST_DB=$DB ./node_modules/.bin/vitest run userDeactivation.db
const DB_PATH = process.env.DEACTIVATION_TEST_DB;
if (DB_PATH) {
    process.env.TURSO_DATABASE_URL = "";
    process.env.ORIGINAL_DATABASE_URL = "";
    process.env.DATABASE_URL = `file:${DB_PATH}`;
    process.env.JWT_SECRET ||= "test-secret-for-deactivation-tests-only";
}

// getSession() reads the token from next/headers; tests set it per call.
let bearer = "";
vi.mock("next/headers", () => ({
    cookies: async () => ({ get: () => undefined }),
    headers: async () => new Headers(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
}));

const NOW = new Date("2026-10-26T20:00:00Z"); // 15:00 CDT
const day = (s: string) => new Date(`${s}T00:00:00.000Z`);

describe.skipIf(!DB_PATH)("deactivateUser (scratch DB)", () => {
    let prisma: any;
    let svc: typeof import("@/lib/userDeactivation");
    let auth: typeof import("@/lib/auth");
    let rollover: typeof import("@/lib/recurringShifts");
    let NextRequest: typeof import("next/server").NextRequest;
    let seq = 0;

    beforeAll(async () => {
        prisma = (await import("@/lib/prisma")).default;
        // Refuse to run against anything but the scratch file.
        const dbs: { file: string }[] = await prisma.$queryRawUnsafe("PRAGMA database_list");
        expect(dbs.some((d) => d.file.endsWith(DB_PATH!.split("/").pop()!))).toBe(true);

        svc = await import("@/lib/userDeactivation");
        auth = await import("@/lib/auth");
        rollover = await import("@/lib/recurringShifts");
        NextRequest = (await import("next/server")).NextRequest;
    });

    beforeEach(async () => {
        // Children first (FK Restrict)
        for (const t of ["sampleRequestItem", "sampleRequest", "break", "recap", "releaseRequest", "shiftRequest", "jobAssignment", "job", "store", "auditLog", "notification", "user", "market"]) {
            await prisma[t].deleteMany({});
        }
    });

    const mkUser = (role = "WORKER", status = "ACTIVE") =>
        prisma.user.create({ data: { email: `u${++seq}@test.dev`, password: "x", name: `User ${seq}`, role, status } });

    async function mkWorld() {
        const admin = await mkUser("ADMIN");
        const market = await prisma.market.create({ data: { name: `Market ${++seq}`, timezone: "America/Chicago" } });
        const storeRow = await prisma.store.create({
            data: { name: "Store", address: "1 Main", latitude: 0, longitude: 0, marketId: market.id, timezone: "America/Chicago" }
        });
        const mkJob = (start: string, end: string, status = "ASSIGNED") => prisma.job.create({
            data: { title: `Job ${++seq}`, startTimeStr: start, endTimeStr: end, storeId: storeRow.id, marketId: market.id, creatorId: admin.id, status }
        });
        return { admin, market, store: storeRow, mkJob };
    }

    const assign = (workerId: string, jobId: string, data: Record<string, any> = {}) =>
        prisma.jobAssignment.create({ data: { workerId, jobId, ...data } });

    it("B1: worker with no history is deactivated and nothing is removed", async () => {
        const { admin } = await mkWorld();
        const w = await mkUser();
        const res = await svc.deactivateUser(w.id, admin.id, NOW);
        expect(res).toEqual({ removedShifts: 0, clockedOut: false, flaggedForReview: 0 });
        const after = await prisma.user.findUnique({ where: { id: w.id } });
        expect(after.status).toBe("DEACTIVATED");
        expect(await prisma.auditLog.count({ where: { action: "USER_DEACTIVATED", entityId: w.id } })).toBe(1);
    });

    it("B2-B10: keeps history, clocks out, removes upcoming shifts, stops recurrence, cancels requests", async () => {
        const { admin, mkJob } = await mkWorld();
        const w = await mkUser();
        await prisma.user.update({ where: { id: w.id }, data: { expoPushToken: "ExponentPushToken[x]" } });
        const other = await mkUser();

        const runningJob = await mkJob("09:00", "17:00");   // 14:00–22:00Z, NOW is inside
        const pastJob = await mkJob("09:00", "17:00");
        const futureJob = await mkJob("09:00", "17:00");     // only this worker → back to OPEN
        const sharedJob = await mkJob("09:00", "17:00");     // also staffed by `other` → stays ASSIGNED
        const laterTodayJob = await mkJob("18:00", "22:00");
        const startedTodayJob = await mkJob("08:00", "12:00");

        // Worked history: recurring, recapped → kept, un-flagged
        const worked = await assign(w.id, pastJob.id, {
            date: day("2026-10-19"), isRecurring: true, status: "COMPLETED",
            clockIn: new Date("2026-10-19T14:00:00Z"), clockOut: new Date("2026-10-19T22:00:00Z"), workedHours: 8
        });
        await prisma.recap.create({ data: { jobId: pastJob.id, assignmentId: worked.id, consumersAttended: 1, consumersSampled: 1 } });
        // Past shift never worked → kept (missed-shift record)
        const missedPast = await assign(w.id, pastJob.id, { date: day("2026-10-22") });
        // Running shift with an open break since 19:30Z
        const running = await assign(w.id, runningJob.id, { date: day("2026-10-26"), status: "IN_PROGRESS", clockIn: new Date("2026-10-26T14:00:00Z") });
        await prisma.break.create({ data: { assignmentId: running.id, startTime: new Date("2026-10-26T19:30:00Z") } });
        // Today: later shift (not started) and a started-but-never-clocked-in shift → both removed
        const laterToday = await assign(w.id, laterTodayJob.id, { date: day("2026-10-26") });
        const startedToday = await assign(w.id, startedTodayJob.id, { date: day("2026-10-26") });
        // Future shifts, one with a pending release request
        const future = await assign(w.id, futureJob.id, { date: day("2026-10-30"), isRecurring: true });
        const futureShared = await assign(w.id, sharedJob.id, { date: day("2026-10-31") });
        await assign(other.id, sharedJob.id, { date: day("2026-10-31") });
        // Undated recurring template → removed
        const template = await assign(w.id, sharedJob.id, { isRecurring: true });
        const rr = await prisma.releaseRequest.create({ data: { jobId: futureJob.id, workerId: w.id, assignmentId: future.id } });
        const sr = await prisma.shiftRequest.create({ data: { jobId: sharedJob.id, workerId: w.id } });

        const res = await svc.deactivateUser(w.id, admin.id, NOW);

        expect(res.clockedOut).toBe(true);
        expect(res.flaggedForReview).toBe(0);
        expect(res.removedShifts).toBe(5);

        const ids = (await prisma.jobAssignment.findMany({ where: { workerId: w.id }, select: { id: true } })).map((a: any) => a.id).sort();
        expect(ids).toEqual([worked.id, missedPast.id, running.id].sort());
        for (const gone of [laterToday, startedToday, future, futureShared, template]) expect(ids).not.toContain(gone.id);

        // Clock-out at NOW, 30-min open break subtracted: 6h gross − 0.5h
        const r = await prisma.jobAssignment.findUnique({ where: { id: running.id }, include: { breaks: true } });
        expect(r.clockOut.toISOString()).toBe(NOW.toISOString());
        expect(r.workedHours).toBe(5.5);
        expect(r.status).toBe("RECAP_PENDING");
        expect(r.breaks[0].endTime.toISOString()).toBe(NOW.toISOString());

        // Recurrence stopped, history intact
        const w1 = await prisma.jobAssignment.findUnique({ where: { id: worked.id }, include: { recap: true } });
        expect(w1.isRecurring).toBe(false);
        expect(w1.recap).not.toBeNull();

        // Jobs
        expect((await prisma.job.findUnique({ where: { id: futureJob.id } })).status).toBe("OPEN");
        expect((await prisma.job.findUnique({ where: { id: sharedJob.id } })).status).toBe("ASSIGNED");

        // Requests cancelled
        expect((await prisma.releaseRequest.findUnique({ where: { id: rr.id } })).status).toBe("CANCELLED");
        expect((await prisma.shiftRequest.findUnique({ where: { id: sr.id } })).status).toBe("CANCELLED");

        // Account
        const u = await prisma.user.findUnique({ where: { id: w.id } });
        expect(u.status).toBe("DEACTIVATED");
        expect(u.expoPushToken).toBeNull();
        const log = await prisma.auditLog.findFirst({ where: { action: "USER_DEACTIVATED", entityId: w.id } });
        expect(JSON.parse(log.newValue).removedAssignmentIds.sort()).toEqual([laterToday, startedToday, future, futureShared, template].map((a) => a.id).sort());

        // Other worker untouched
        expect(await prisma.jobAssignment.count({ where: { workerId: other.id } })).toBe(1);
    });

    it("B4: clocked in past shift end → clock-out capped at shift end and flagged", async () => {
        const { admin, mkJob } = await mkWorld();
        const w = await mkUser();
        const job = await mkJob("06:00", "10:00"); // 11:00–15:00Z, NOW is 20:00Z
        const a = await assign(w.id, job.id, { date: day("2026-10-26"), status: "IN_PROGRESS", clockIn: new Date("2026-10-26T11:00:00Z") });
        const res = await svc.deactivateUser(w.id, admin.id, NOW);
        expect(res.flaggedForReview).toBe(1);
        const r = await prisma.jobAssignment.findUnique({ where: { id: a.id } });
        expect(r.clockOut.toISOString()).toBe("2026-10-26T15:00:00.000Z");
        expect(r.workedHours).toBe(4);
    });

    it("keeps a future shift that has a sample request", async () => {
        const { admin, mkJob } = await mkWorld();
        const w = await mkUser();
        const job = await mkJob("09:00", "17:00");
        const a = await assign(w.id, job.id, { date: day("2026-10-30") });
        // SampleRequest is FK Restrict on the assignment, so it must never be deleted
        await prisma.sampleRequest.create({ data: { workerId: w.id, assignmentId: a.id, storeName: "Store", storeAddress: "1 Main" } });
        await svc.deactivateUser(w.id, admin.id, NOW);
        expect(await prisma.jobAssignment.count({ where: { id: a.id } })).toBe(1);
    });

    it("B11: already deactivated → 409 and no second audit row", async () => {
        const { admin } = await mkWorld();
        const w = await mkUser();
        await svc.deactivateUser(w.id, admin.id, NOW);
        await expect(svc.deactivateUser(w.id, admin.id, NOW)).rejects.toMatchObject({ status: 409 });
        expect(await prisma.auditLog.count({ where: { entityId: w.id } })).toBe(1);
    });

    it("B12: two concurrent deactivations → exactly one succeeds", async () => {
        const { admin } = await mkWorld();
        const w = await mkUser();
        const results = await Promise.allSettled([svc.deactivateUser(w.id, admin.id, NOW), svc.deactivateUser(w.id, admin.id, NOW)]);
        expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
        expect(await prisma.auditLog.count({ where: { action: "USER_DEACTIVATED", entityId: w.id } })).toBe(1);
    });

    it("B13: self-deactivation is refused", async () => {
        const { admin } = await mkWorld();
        await expect(svc.deactivateUser(admin.id, admin.id, NOW)).rejects.toMatchObject({ status: 400 });
        expect((await prisma.user.findUnique({ where: { id: admin.id } })).status).toBe("ACTIVE");
    });

    it("B14: two admins deactivating each other at once leaves one active", async () => {
        const a1 = await mkUser("ADMIN");
        const a2 = await mkUser("ADMIN");
        await Promise.allSettled([svc.deactivateUser(a1.id, a2.id, NOW), svc.deactivateUser(a2.id, a1.id, NOW)]);
        expect(await prisma.user.count({ where: { role: "ADMIN", status: "ACTIVE" } })).toBeGreaterThanOrEqual(1);
    });

    it("B16: unknown id → 404", async () => {
        const { admin } = await mkWorld();
        await expect(svc.deactivateUser("nope", admin.id, NOW)).rejects.toMatchObject({ status: 404 });
    });

    it("B17: a failure mid-transaction rolls everything back", async () => {
        const { mkJob } = await mkWorld();
        const w = await mkUser();
        const job = await mkJob("09:00", "17:00");
        await assign(w.id, job.id, { date: day("2026-10-30") });
        // AuditLog.actorId is a FK, so a bogus actor fails the last write of the tx
        await expect(svc.deactivateUser(w.id, "missing-actor", NOW)).rejects.toBeTruthy();
        expect((await prisma.user.findUnique({ where: { id: w.id } })).status).toBe("ACTIVE");
        expect(await prisma.jobAssignment.count({ where: { workerId: w.id } })).toBe(1);
    });

    it("A1/A2/A9: requireAuth returns 401 for a deactivated token, 403 for a wrong role", async () => {
        const { admin } = await mkWorld();
        const w = await mkUser();
        const mgr = await mkUser("MARKET_MANAGER");
        const token = (u: any) => auth.encrypt({ user: { id: u.id, email: u.email, role: u.role } }, "180d");
        const req = async (u: any) => new NextRequest("http://x/api/timeclock", { headers: { Authorization: `Bearer ${await token(u)}` } });

        await expect(auth.requireAuth(await req(w))).resolves.toMatchObject({ id: w.id });
        await svc.deactivateUser(w.id, admin.id, NOW);
        await expect(auth.requireAuth(await req(w))).rejects.toMatchObject({ status: 401 });
        await expect(auth.requireAuth(await req(mgr), ["ADMIN"])).rejects.toMatchObject({ status: 403 });
    });

    it("A3: getSession returns null for a deactivated user (every getSession route answers 401)", async () => {
        const { admin } = await mkWorld();
        const w = await mkUser();
        bearer = await auth.encrypt({ user: { id: w.id, email: w.email, role: w.role } }, "180d");
        expect(await auth.getSession()).not.toBeNull();
        await svc.deactivateUser(w.id, admin.id, NOW);
        expect(await auth.getSession()).toBeNull();
        bearer = "";
    });

    it("B19/B20: rollover never re-creates shifts for a deactivated worker", async () => {
        const { mkJob } = await mkWorld();
        const w = await mkUser("WORKER", "DEACTIVATED");
        const job = await mkJob("09:00", "17:00");
        const { getPreviousCycleDates } = await import("@/lib/cycles");
        const prev = getPreviousCycleDates();
        await assign(w.id, job.id, { date: new Date(prev.start), isRecurring: true });
        await rollover.ensureCurrentCycleAssignments(w.id);
        await rollover.ensureNextCyclePreview(w.id);
        expect(await prisma.jobAssignment.count({ where: { workerId: w.id } })).toBe(1);
    });

    it("C7: assign guard refuses deactivated workers", async () => {
        const { admin } = await mkWorld();
        const w = await mkUser();
        expect(await svc.unassignableWorkerError(w.id)).toBeNull();
        await svc.deactivateUser(w.id, admin.id, NOW);
        expect(await svc.unassignableWorkerError(w.id)).toBe("Worker is deactivated");
        expect(await svc.unassignableWorkerError("nope")).toBe("Worker not found");
    });

    it("A8: reactivation restores access only", async () => {
        const { admin, mkJob } = await mkWorld();
        const w = await mkUser();
        const job = await mkJob("09:00", "17:00");
        await assign(w.id, job.id, { date: day("2026-10-30") });
        await svc.deactivateUser(w.id, admin.id, NOW);
        await svc.reactivateUser(w.id, admin.id);
        expect((await prisma.user.findUnique({ where: { id: w.id } })).status).toBe("ACTIVE");
        expect(await prisma.jobAssignment.count({ where: { workerId: w.id } })).toBe(0);
        await expect(svc.reactivateUser(w.id, admin.id)).rejects.toMatchObject({ status: 409 });
        await expect(svc.reactivateUser("nope", admin.id)).rejects.toMatchObject({ status: 404 });
    });
});
