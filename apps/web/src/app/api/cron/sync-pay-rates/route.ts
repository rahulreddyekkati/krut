import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveRateForDate } from "@/lib/payRate";

// Closes the staleness gap that PATCH /api/users/[id] alone can't: that route only recomputes
// a worker's live "rate as of today" scalar (User.hourlyWage) when someone edits their rate
// again. A future-dated raise with no further edits would otherwise sit unchanged forever
// after its effective date passes — and User.hourlyWage isn't just a display artifact,
// requireAuth (apps/web/src/lib/auth.ts) re-SELECTs it from the DB on every authenticated
// request, so session/profile/`/api/auth/me` would stay stale indefinitely too.
//
// Run daily, shortly after UTC midnight (see vercel.json) — matches this app's existing
// convention of treating shift/rate dates as UTC-midnight calendar markers rather than
// per-market real time (see JobAssignment.date, PayRateHistory.effectiveFrom).
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    const legacySecret = request.headers.get("x-cron-secret");
    const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (process.env.CRON_SECRET !== bearerSecret && process.env.CRON_SECRET !== legacySecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const todayMarker = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    // Only workers who've ever had a tracked rate change need syncing — a worker with zero
    // PayRateHistory rows has nothing that could have gone stale (resolveRateForDate falls
    // back straight to the current scalar for them, same as pre-feature behavior).
    const historyRows = await prisma.payRateHistory.findMany({
        orderBy: { effectiveFrom: "asc" },
        select: { workerId: true, hourlyWage: true, effectiveFrom: true }
    });

    const byWorker = new Map<string, { hourlyWage: number; effectiveFrom: Date }[]>();
    for (const r of historyRows) {
        if (!byWorker.has(r.workerId)) byWorker.set(r.workerId, []);
        byWorker.get(r.workerId)!.push({ hourlyWage: r.hourlyWage, effectiveFrom: r.effectiveFrom });
    }

    const workers = await prisma.user.findMany({
        where: { id: { in: [...byWorker.keys()] } },
        select: { id: true, name: true, hourlyWage: true }
    });

    let updated = 0;
    let errors = 0;

    for (const worker of workers) {
        try {
            const resolved = resolveRateForDate(byWorker.get(worker.id), todayMarker, worker.hourlyWage);
            if (resolved !== worker.hourlyWage) {
                await prisma.user.update({ where: { id: worker.id }, data: { hourlyWage: resolved } });
                updated++;
            }
        } catch (e) {
            console.error(`sync-pay-rates failed for worker ${worker.id} (${worker.name}):`, e);
            errors++;
        }
    }

    return NextResponse.json({ success: true, checked: workers.length, updated, errors });
}
