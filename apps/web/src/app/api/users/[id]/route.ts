import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, requireAuth } from "@/lib/auth";
import { AppError, handleApiError } from "@/lib/apiError";
import { deactivateUser } from "@/lib/userDeactivation";
import { resolveTimezone, toLocalDateStr, toUTCLocalDateStr } from "@/lib/timezone";
import { resolveRateForDate } from "@/lib/payRate";

// GET /api/users/[id] - Get single user
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await context.params;

        if (
            session.user.role !== "ADMIN" &&
            session.user.role !== "MARKET_MANAGER" &&
            session.user.id !== id
        ) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                market: true,
                managedMarket: true
            }
        });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH /api/users/[id] - Update user details
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        const body = await request.json();
        const { role, status, hourlyWage, wageEffectiveFrom, name, email: rawEmail, marketId, managedMarketId, manualWorkedHours } = body;
        const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : rawEmail;

        // Deactivation has its own transaction (clock-out, shift cleanup, audit) — see
        // lib/userDeactivation.ts. It runs after the field updates below.
        const deactivating = status === "DEACTIVATED";

        const updateData: Record<string, any> = {
            role,
            status: deactivating ? undefined : status,
            name,
            email,
            manualWorkedHours: manualWorkedHours !== undefined ? parseFloat(manualWorkedHours) : undefined,
            marketId,
            managedMarketId
        };

        // ---- Effective-dated pay rate handling ----
        // hourlyWage === undefined → not being changed, leave untouched.
        // hourlyWage === null      → explicitly clearing the rate; "no rate" isn't an
        //                            effective-dated concept, so skip history entirely.
        // hourlyWage === a number  → an intentional rate change, tracked via PayRateHistory.
        const isClearingWage = hourlyWage === null;
        const isSettingWage = hourlyWage !== undefined && hourlyWage !== null;

        let parsedWage: number | undefined;
        let wageEffectiveFromDate: Date | undefined;
        let createdAtMarker: Date | undefined;
        let existingUser: { hourlyWage: number | null; createdAt: Date } | null = null;

        if (isClearingWage) {
            updateData.hourlyWage = null;
        } else if (isSettingWage) {
            parsedWage = parseFloat(hourlyWage);
            if (!Number.isFinite(parsedWage) || parsedWage < 0) {
                return NextResponse.json({ error: "hourlyWage must be a non-negative number" }, { status: 400 });
            }

            existingUser = await prisma.user.findUnique({
                where: { id },
                select: { hourlyWage: true, createdAt: true }
            });
            if (!existingUser) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            const tz = resolveTimezone(request);
            const effectiveFromStr: string = typeof wageEffectiveFrom === "string" && wageEffectiveFrom
                ? wageEffectiveFrom
                : toLocalDateStr(new Date(), tz); // no date given (e.g. mobile) → effective today

            if (!/^\d{4}-\d{2}-\d{2}$/.test(effectiveFromStr)) {
                return NextResponse.json({ error: "wageEffectiveFrom must be a YYYY-MM-DD date" }, { status: 400 });
            }
            wageEffectiveFromDate = new Date(`${effectiveFromStr}T00:00:00.000Z`);
            if (isNaN(wageEffectiveFromDate.getTime())) {
                return NextResponse.json({ error: "wageEffectiveFrom is not a valid date" }, { status: 400 });
            }

            // Tracking starts at the earlier of account creation and the worker's first dated
            // shift (imported/backfilled shifts can predate the account), so admins can
            // correct the rate for every shift on record. Reject anything earlier — otherwise
            // an admin could submit a date earlier than the lazy-backfill base row below,
            // silently redefining what "before tracking" means and undermining the
            // earliest-row fallback that apps/web/src/lib/payRate.ts relies on.
            createdAtMarker = new Date(`${toUTCLocalDateStr(existingUser.createdAt)}T00:00:00.000Z`);
            const firstShift = await prisma.jobAssignment.findFirst({
                where: { workerId: id, date: { not: null } },
                orderBy: { date: "asc" },
                select: { date: true },
            });
            // JobAssignment.date is already a UTC-midnight calendar marker — compare as-is.
            if (firstShift?.date && firstShift.date.getTime() < createdAtMarker.getTime()) {
                createdAtMarker = firstShift.date;
            }
            if (wageEffectiveFromDate.getTime() < createdAtMarker.getTime()) {
                return NextResponse.json({
                    error: `Effective date can't be before this worker's first day on record (${toUTCLocalDateStr(createdAtMarker)})`
                }, { status: 400 });
            }
        }

        const user = await prisma.$transaction(async (tx: any) => {
            if (isSettingWage && wageEffectiveFromDate && existingUser) {
                // Lazy backfill (only on a worker's very first tracked change): anchor "the
                // rate before tracking started" truthfully, using the value about to be
                // overwritten, instead of guessing later. Skipped if there's no prior wage to
                // preserve, or if the submitted date happens to land exactly on this anchor
                // (the upsert below already covers that date).
                if (existingUser.hourlyWage != null && createdAtMarker && createdAtMarker.getTime() !== wageEffectiveFromDate.getTime()) {
                    const historyCount = await tx.payRateHistory.count({ where: { workerId: id } });
                    if (historyCount === 0) {
                        await tx.payRateHistory.create({
                            data: {
                                workerId: id,
                                hourlyWage: existingUser.hourlyWage,
                                effectiveFrom: createdAtMarker,
                                changedById: null,
                            }
                        });
                    }
                }

                await tx.payRateHistory.upsert({
                    where: { workerId_effectiveFrom: { workerId: id, effectiveFrom: wageEffectiveFromDate } },
                    update: { hourlyWage: parsedWage, changedById: session.user.id },
                    create: { workerId: id, hourlyWage: parsedWage, effectiveFrom: wageEffectiveFromDate, changedById: session.user.id },
                });

                await tx.auditLog.create({
                    data: {
                        actorId: session.user.id,
                        action: "HOURLY_WAGE_CHANGE",
                        entityType: "User",
                        entityId: id,
                        oldValue: JSON.stringify({ hourlyWage: existingUser.hourlyWage }),
                        newValue: JSON.stringify({ hourlyWage: parsedWage, effectiveFrom: wageEffectiveFromDate.toISOString() }),
                    }
                });

                // Recompute the live "rate as of today" scalar from the full history rather
                // than blindly assigning the submitted value — correctly leaves today's live
                // rate untouched for a future-dated change, applies immediately for a
                // past/today-dated one, and stays at a later row's value if this edit was a
                // backdated correction superseded by an already-existing later row.
                const tz = resolveTimezone(request);
                const todayMarker = new Date(`${toLocalDateStr(new Date(), tz)}T00:00:00.000Z`);
                const fullHistory = await tx.payRateHistory.findMany({
                    where: { workerId: id },
                    orderBy: { effectiveFrom: "asc" },
                    select: { hourlyWage: true, effectiveFrom: true }
                });
                updateData.hourlyWage = resolveRateForDate(fullHistory, todayMarker, existingUser.hourlyWage);
            }

            const updatedUser = await tx.user.update({
                where: { id },
                data: updateData
            });

            return updatedUser;
        });

        if (deactivating) {
            const result = await deactivateUser(id, session.user.id);
            return NextResponse.json({ ...user, status: "DEACTIVATED", deactivation: result });
        }

        return NextResponse.json(user);
    } catch (error: any) {
        if (error instanceof AppError) return handleApiError(error);
        console.error("Update user error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/users/[id] - Deactivate user. Never hard-deletes: worked shifts, recaps and
// payroll reference the user (FK Restrict), and history must stay visible in Reports.
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await requireAuth(request, ["ADMIN"]);
        const { id } = await context.params;
        const result = await deactivateUser(id, admin.id);
        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        return handleApiError(error);
    }
}
