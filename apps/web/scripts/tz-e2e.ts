/**
 * End-to-end timezone check against a SCRATCH SQLite database. Drives the real route
 * handlers (clock-in, clock-out, auto clock-out cron, recap submit, admin recap list)
 * for one store per zone, with the phone's timezone header wrong and then missing, and
 * asserts every result lands on the store's own clock.
 *
 * Refuses to run against anything but a local file database. From apps/web:
 *
 *   DB=/abs/path/test.db
 *   TURSO_DATABASE_URL="" ORIGINAL_DATABASE_URL="" DATABASE_URL="file:$DB" \
 *     ../../node_modules/.bin/prisma db push --schema ../../prisma/schema.prisma --skip-generate
 *   TURSO_DATABASE_URL="" ORIGINAL_DATABASE_URL="" DATABASE_URL="file:$DB" \
 *     npx tsx --tsconfig tsconfig.json scripts/tz-e2e.ts
 *
 * Run it under TZ=UTC and TZ=America/Chicago; both must pass.
 */
if (process.env.TURSO_DATABASE_URL || process.env.ORIGINAL_DATABASE_URL || !process.env.DATABASE_URL?.startsWith("file:")) {
    console.error("Refusing to run: needs TURSO_DATABASE_URL=\"\" ORIGINAL_DATABASE_URL=\"\" and DATABASE_URL=file:/…");
    process.exit(2);
}
process.env.JWT_SECRET = process.env.JWT_SECRET || "tz-e2e-secret";
process.env.CRON_SECRET = "tz-e2e-cron";

// A controllable clock: `new Date()` and `Date.now()` return `fakeNow`.
const RealDate = Date;
let fakeNow = RealDate.parse("2026-10-02T01:30:00.000Z");
class FakeDate extends RealDate {
    constructor(...args: any[]) {
        if (args.length === 0) super(fakeNow);
        else super(...(args as [any]));
    }
    static now() { return fakeNow; }
}
(globalThis as any).Date = FakeDate;
const setNow = (iso: string) => { fakeNow = RealDate.parse(iso); };

let failures = 0;
const check = (label: string, actual: unknown, expected: unknown) => {
    const ok = actual === expected;
    if (!ok) failures++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n        expected ${expected}\n        actual   ${actual}`}`);
};
const iso = (d: Date | null | undefined) => (d ? new RealDate(d).toISOString() : String(d));

async function main() {
    const { NextRequest } = await import("next/server");
    const { default: prisma } = await import("@/lib/prisma");
    const { encrypt } = await import("@/lib/session");
    const timeclock = await import("@/app/api/timeclock/route");
    const cron = await import("@/app/api/cron/auto-clockout/route");
    const jobClockIn = await import("@/app/api/jobs/[id]/clock-in/route");
    const submitRecap = await import("@/app/api/worker/submit-recap/route");
    const adminRecaps = await import("@/app/api/admin/recaps/route");

    if ((await prisma.user.count()) !== 0) {
        console.error("Refusing to run: the database is not empty. Use a fresh scratch file.");
        process.exit(2);
    }

    const ZONES = [
        { key: "Eastern", tz: "America/New_York", end19: "2026-10-01T23:00:00.000Z", in15: "2026-10-01T19:00:00.000Z" },
        { key: "Central", tz: "America/Chicago", end19: "2026-10-02T00:00:00.000Z", in15: "2026-10-01T20:00:00.000Z" },
        { key: "Mountain", tz: "America/Denver", end19: "2026-10-02T01:00:00.000Z", in15: "2026-10-01T21:00:00.000Z" },
    ];
    const OCT1 = new RealDate("2026-10-01T00:00:00.000Z");

    const admin = await prisma.user.create({ data: { email: "admin@test", password: "x", name: "Admin", role: "ADMIN", status: "ACTIVE" } });
    let n = 0;
    const mkWorker = async (marketId: string) =>
        prisma.user.create({ data: { email: `w${++n}@test`, password: "x", name: `Worker ${n}`, role: "WORKER", status: "ACTIVE", marketId } });
    const token = async (u: { id: string }) => encrypt({ user: { id: u.id } });
    const call = async (url: string, method: string, user: { id: string } | null, headers: Record<string, string>, body?: unknown) =>
        new NextRequest(`http://test${url}`, {
            method,
            headers: { ...(user ? { Authorization: `Bearer ${await token(user)}` } : {}), "Content-Type": "application/json", ...headers },
            ...(body ? { body: JSON.stringify(body) } : {}),
        });

    const stores: Record<string, { id: string; marketId: string; tz: string }> = {};
    for (const z of ZONES) {
        const market = await prisma.market.create({ data: { name: z.key, timezone: z.tz } });
        const store = await prisma.store.create({
            data: { name: `${z.key} Store`, address: "1 Main St", latitude: 40, longitude: -100, radius: 100, timezone: z.tz, marketId: market.id },
        });
        stores[z.key] = { id: store.id, marketId: market.id, tz: z.tz };
    }
    const mkShift = async (zoneKey: string, title: string, opts: { clockIn?: string; date?: Date | null; start?: string; end?: string; recurring?: boolean; dayOfWeek?: number; status?: string; clockOut?: string }) => {
        const s = stores[zoneKey];
        const worker = await mkWorker(s.marketId);
        const job = await prisma.job.create({
            data: { title, startTimeStr: opts.start ?? "15:00", endTimeStr: opts.end ?? "19:00", storeId: s.id, marketId: s.marketId, creatorId: admin.id, date: opts.recurring ? null : OCT1 },
        });
        const assignment = await prisma.jobAssignment.create({
            data: {
                jobId: job.id, workerId: worker.id,
                date: opts.date === undefined ? OCT1 : opts.date,
                isRecurring: !!opts.recurring, dayOfWeek: opts.dayOfWeek ?? null,
                clockIn: opts.clockIn ? new RealDate(opts.clockIn) : null,
                clockOut: opts.clockOut ? new RealDate(opts.clockOut) : null,
                status: opts.status ?? (opts.clockIn ? "IN_PROGRESS" : "ASSIGNED"),
            } as any,
        });
        return { worker, job, assignment };
    };
    const reload = (id: string) => prisma.jobAssignment.findUnique({ where: { id } });

    // ── 1. Clock-out after scheduled end is capped at the store's 7:00 PM ──────────
    // Now = 9:30 PM Eastern / 8:30 PM Central / 7:30 PM Mountain on Oct 1.
    setNow("2026-10-02T01:30:00.000Z");
    for (const z of ZONES) {
        for (const [label, headers] of [
            ["phone reports Central", { "x-timezone": "America/Chicago", "x-timezone-offset": "300" }],
            ["no timezone header, offset 360", { "x-timezone-offset": "360" }],
        ] as const) {
            const { worker, assignment } = await mkShift(z.key, `cap ${z.key} ${label}`, { clockIn: z.in15 });
            const res = await timeclock.POST(await call("/api/timeclock", "POST", worker, headers, { action: "CLOCK_OUT", assignmentId: assignment.id }));
            check(`clock-out cap, ${z.key} store, ${label} (HTTP ${res.status})`, iso((await reload(assignment.id))?.clockOut), z.end19);
        }
    }

    // ── 2. Auto clock-out when the app polls GET /timeclock ────────────────────────
    for (const z of ZONES) {
        const { worker, assignment } = await mkShift(z.key, `poll ${z.key}`, { clockIn: z.in15 });
        await timeclock.GET(await call("/api/timeclock", "GET", worker, { "x-timezone": "America/Los_Angeles" }));
        check(`auto clock-out on app poll, ${z.key} store, phone reports Pacific`, iso((await reload(assignment.id))?.clockOut), z.end19);
    }

    // ── 3. A shift that has NOT reached its store's end is left alone ──────────────
    // Now = 6:30 PM Mountain, which is 7:30 PM Central: the old Central-based check
    // clocked this worker out an hour early.
    setNow("2026-10-02T00:30:00.000Z");
    {
        const { worker, assignment } = await mkShift("Mountain", "early mountain", { clockIn: "2026-10-01T21:00:00.000Z" });
        await timeclock.GET(await call("/api/timeclock", "GET", worker, { "x-timezone-offset": "360" }));
        check("Mountain shift at 6:30 PM local is still clocked in (app poll, no header)", iso((await reload(assignment.id))?.clockOut), "null");
        await cron.GET(await call("/api/cron/auto-clockout", "GET", null, { "x-cron-secret": "tz-e2e-cron" }));
        check("Mountain shift at 6:30 PM local is still clocked in (cron)", iso((await reload(assignment.id))?.clockOut), "null");
    }

    // ── 4. Auto clock-out cron ─────────────────────────────────────────────────────
    setNow("2026-10-02T01:30:00.000Z");
    {
        const made = [];
        for (const z of ZONES) made.push({ z, ...(await mkShift(z.key, `cron ${z.key}`, { clockIn: z.in15 })) });
        await cron.GET(await call("/api/cron/auto-clockout", "GET", null, { "x-cron-secret": "tz-e2e-cron" }));
        for (const m of made) check(`auto clock-out cron, ${m.z.key} store`, iso((await reload(m.assignment.id))?.clockOut), m.z.end19);
    }

    // ── 5. Shift date stamped at clock-in is the store's day, not the phone's ──────
    // Now = 11:30 PM Mountain on Thursday Oct 1 (already Oct 2 in Eastern and Central).
    setNow("2026-10-02T05:30:00.000Z");
    {
        const a = await mkShift("Mountain", "recurring A", { recurring: true, date: null, dayOfWeek: 4, start: "20:00", end: "23:59" });
        const res = await timeclock.POST(await call("/api/timeclock", "POST", a.worker, { "x-app-client": "mobile-app", "x-timezone": "America/New_York" }, { action: "CLOCK_IN", assignmentId: a.assignment.id }));
        const row = await prisma.jobAssignment.findFirst({ where: { jobId: a.job.id, workerId: a.worker.id, clockIn: { not: null } } });
        check(`clock-in via /timeclock, Mountain store, phone reports Eastern (HTTP ${res.status})`, iso(row?.date), "2026-10-01T00:00:00.000Z");

        const b = await mkShift("Mountain", "recurring B", { recurring: true, date: null, dayOfWeek: 4, start: "20:00", end: "23:59" });
        const res2 = await jobClockIn.POST(
            await call(`/api/jobs/${b.job.id}/clock-in`, "POST", b.worker, { "x-app-client": "mobile-app", "x-timezone-offset": "300" }, { latitude: 40, longitude: -100 }),
            { params: Promise.resolve({ id: b.job.id }) }
        );
        const row2 = await prisma.jobAssignment.findFirst({ where: { jobId: b.job.id, workerId: b.worker.id, clockIn: { not: null } } });
        check(`clock-in via /jobs/[id]/clock-in, Mountain store, no header (HTTP ${res2.status})`, iso(row2?.date), "2026-10-01T00:00:00.000Z");
    }

    // ── 6. Recap resubmitted without an assignmentId attaches to today's worked shift ─
    {
        const s = await mkShift("Mountain", "resubmit", { clockIn: "2026-10-02T02:00:00.000Z", clockOut: "2026-10-02T05:00:00.000Z", status: "RECAP_PENDING", start: "20:00", end: "23:00" });
        await prisma.recap.create({ data: { jobId: s.job.id, assignmentId: s.assignment.id, consumersAttended: 1, consumersSampled: 1, status: "REJECTED" } });
        // a future occurrence of the same job that must NOT receive the recap
        await prisma.jobAssignment.create({ data: { jobId: s.job.id, workerId: s.worker.id, date: new RealDate("2026-10-08T00:00:00.000Z"), isRecurring: true } });
        const res = await submitRecap.POST(await call("/api/worker/submit-recap", "POST", s.worker, { "x-timezone": "America/New_York" }, { jobId: s.job.id, customersSampled: 5, receiptTotal: 0, reimbursementTotal: 0 }));
        const recap = await prisma.recap.findUnique({ where: { assignmentId: s.assignment.id } });
        check(`recap resubmit without assignmentId lands on the worked shift (HTTP ${res.status})`, `${recap?.status}/${recap?.consumersSampled}`, "PENDING/5");
    }

    // ── 7. Reviewed-tab date filter matches the shift date on any server clock ─────
    {
        const s = await mkShift("Eastern", "reviewed", { clockIn: "2026-10-01T19:00:00.000Z", clockOut: "2026-10-01T23:00:00.000Z", status: "COMPLETED" });
        await prisma.recap.create({ data: { jobId: s.job.id, assignmentId: s.assignment.id, consumersAttended: 1, consumersSampled: 1, status: "APPROVED" } });
        const ids = async (date: string) => {
            const res = await adminRecaps.GET(await call(`/api/admin/recaps?status=APPROVED&date=${date}`, "GET", admin, {}));
            return ((await res.json()).recaps as any[]).map((r) => r.shiftDate && new RealDate(r.shiftDate).toISOString().slice(0, 10));
        };
        check("Reviewed filter for Oct 1 returns only Oct 1 shifts", [...new Set(await ids("2026-10-01"))].join(","), "2026-10-01");
        check("Reviewed filter for Oct 2 returns nothing", (await ids("2026-10-02")).length, 0);
        check("Reviewed filter for Sep 30 returns nothing", (await ids("2026-09-30")).length, 0);
    }

    console.log(`\nServer TZ=${process.env.TZ || "(system)"}: ${failures === 0 ? "all checks passed" : `${failures} FAILED`}`);
    await prisma.$disconnect();
    process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
