import { NextRequest, NextResponse } from "next/server";
import { formatInTimeZone } from "date-fns-tz";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { buildDateMarkerRange } from "@/lib/payroll";
import { STORE_CHAINS, STORE_CHAIN_LABELS, type StoreChain } from "@/lib/storeChain";
import { to12hr } from "@/lib/timeFormat";
import { BRAND_LABELS } from "@/lib/brand";

const BRANDS = ["KRUTO", "MULUK", "BOTH", "UNALLOCATED"] as const;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Job.date and JobAssignment.date are calendar markers (UTC midnight of the local date) —
// see lib/payroll.ts. Read the day straight off the ISO string, never through a timezone.
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

const strList = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.length > 0) : [];

// POST /api/admin/jobs/export — CSV of every dated shift in [startDate, endDate] matching
// the given store type / markets / stores / brands. An empty list means "all" for each filter.
// POST rather than GET so a long multi-store selection can't overflow the URL.
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);
        const body = await request.json().catch(() => ({}));

        const startDate = typeof body.startDate === "string" ? body.startDate : "";
        const endDate = typeof body.endDate === "string" ? body.endDate : "";
        if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate)) {
            throw new AppError("A valid from and to date are required", 400);
        }
        if (endDate < startDate) {
            throw new AppError("The to date must be on or after the from date", 400);
        }

        const chains = strList(body.chains).filter(c => (STORE_CHAINS as readonly string[]).includes(c));
        const brands = strList(body.brands).filter(b => (BRANDS as readonly string[]).includes(b));
        let marketIds = strList(body.marketIds);
        const storeIds = strList(body.storeIds);

        // Market Managers only ever see their own market, whatever was requested.
        if (user.role === "MARKET_MANAGER") {
            marketIds = [user.managedMarketId || user.marketId || "__none__"];
        }

        const storeWhere: any = {};
        if (chains.length) storeWhere.chain = { in: chains };
        if (marketIds.length) storeWhere.marketId = { in: marketIds };
        if (storeIds.length) storeWhere.id = { in: storeIds };

        const { dateMarkerStart, dateMarkerEnd } = buildDateMarkerRange(startDate, endDate);
        const dateRange = { gte: dateMarkerStart, lte: dateMarkerEnd };

        const brandWhere: any = brands.length
            ? {
                OR: [
                    ...(brands.some(b => b !== "UNALLOCATED")
                        ? [{ brandAllocation: { in: brands.filter(b => b !== "UNALLOCATED") } }]
                        : []),
                    ...(brands.includes("UNALLOCATED") ? [{ brandAllocation: null }] : []),
                ],
            }
            : {};

        const storeInclude = { store: { include: { market: { select: { name: true } } } } };

        const assignments = await prisma.jobAssignment.findMany({
            where: {
                date: dateRange,
                job: { store: storeWhere },
                ...brandWhere,
            },
            include: {
                worker: { select: { name: true, email: true } },
                job: { include: storeInclude },
            },
        });

        // A dated job with nobody on its own date is still a scheduled shift — list it as
        // Unassigned, under the job's own brand.
        const unassignedJobs = await prisma.job.findMany({
            where: {
                date: dateRange,
                store: storeWhere,
                ...(brands.length ? { OR: brandWhere.OR.map((c: any) => ({ brand: c.brandAllocation })) } : {}),
            },
            include: { ...storeInclude, assignments: { select: { date: true } } },
        });

        type Row = {
            date: string; market: string; store: string; chain: string; job: string;
            worker: string; email: string; brand: string; start: string; end: string;
            status: string; clockIn: string; clockOut: string; breakMin: string;
            hours: string; bonus: string;
        };
        const rows: Row[] = [];

        const fmtClock = (d: Date | null, tz: string) => (d ? formatInTimeZone(d, tz, "yyyy-MM-dd h:mm a zzz") : "");
        const brandLabel = (b: string | null) => (b ? BRAND_LABELS[b as keyof typeof BRAND_LABELS] ?? b : "Unallocated");
        const chainLabel = (c: string) => STORE_CHAIN_LABELS[c as StoreChain] ?? c;

        for (const a of assignments) {
            const job = a.job;
            const store = job.store;
            const open = a.status === "AVAILABLE";
            const bonus = (job.bonus || 0) + (a.bonus || 0);
            rows.push({
                date: dayKey(a.date!),
                market: store.market?.name ?? "",
                store: store.name,
                chain: chainLabel(store.chain),
                job: job.title,
                worker: open ? "Open (released)" : a.worker?.name ?? "",
                email: open ? "" : a.worker?.email ?? "",
                brand: brandLabel(a.brandAllocation),
                start: to12hr(a.customStartTimeStr || job.startTimeStr),
                end: to12hr(a.customEndTimeStr || job.endTimeStr),
                status: a.status,
                clockIn: fmtClock(a.clockIn, store.timezone),
                clockOut: fmtClock(a.clockOut, store.timezone),
                breakMin: a.breakTimeMinutes ? String(a.breakTimeMinutes) : "",
                hours: a.workedHours != null ? a.workedHours.toFixed(2) : "",
                bonus: bonus ? bonus.toFixed(2) : "",
            });
        }

        for (const job of unassignedJobs) {
            const jobKey = dayKey(job.date!);
            if (job.assignments.some(a => a.date && dayKey(a.date) === jobKey)) continue;
            rows.push({
                date: jobKey,
                market: job.store.market?.name ?? "",
                store: job.store.name,
                chain: chainLabel(job.store.chain),
                job: job.title,
                worker: "Unassigned",
                email: "",
                brand: brandLabel(job.brand),
                start: to12hr(job.startTimeStr),
                end: to12hr(job.endTimeStr),
                status: job.status,
                clockIn: "",
                clockOut: "",
                breakMin: "",
                hours: "",
                bonus: job.bonus ? job.bonus.toFixed(2) : "",
            });
        }

        rows.sort((x, y) =>
            x.date.localeCompare(y.date) ||
            x.market.localeCompare(y.market) ||
            x.store.localeCompare(y.store) ||
            x.start.localeCompare(y.start) ||
            x.worker.localeCompare(y.worker)
        );

        const q = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
        const header = [
            "Date", "Day", "Market", "Store", "Store Type", "Job", "Worker", "Worker Email", "Brand",
            "Start Time", "End Time", "Status", "Clock In", "Clock Out", "Break (min)", "Worked Hours", "Bonus",
        ];
        const lines = [header.join(",")];
        for (const r of rows) {
            const weekday = new Date(`${r.date}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
            lines.push([
                r.date, weekday, r.market, r.store, r.chain, r.job, r.worker, r.email, r.brand,
                r.start, r.end, r.status, r.clockIn, r.clockOut, r.breakMin, r.hours, r.bonus,
            ].map(q).join(","));
        }

        return new NextResponse(lines.join("\n") + "\n", {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="Shifts_${startDate}_to_${endDate}.csv"`,
                "X-Row-Count": String(rows.length),
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}
