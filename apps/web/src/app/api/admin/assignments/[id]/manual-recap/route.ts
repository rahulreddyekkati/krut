import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { validate, manualRecapSchema } from "@/lib/validate";

/**
 * POST /api/admin/assignments/[id]/manual-recap
 *
 * Admin/market-manager equivalent of the worker's own submit-recap flow, for a
 * shift stuck in RECAP_PENDING with no recap submitted (or a rejected one) —
 * e.g. transcribing a recap a worker handed in on paper. Creates a PENDING
 * Recap (+ RecapSKU rows) exactly like the worker route would, and optionally
 * corrects the assignment's clockIn/clockOut/breakTimeMinutes if the actual
 * worked time didn't match what's on file. The assignment itself stays
 * RECAP_PENDING — this only gets the shift out of the "Incomplete" bucket and
 * into "Pending Review", where the normal approve/reject flow takes over.
 */
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);
        const { id: assignmentId } = await context.params;

        const {
            clockIn: clockInRaw,
            clockOut: clockOutRaw,
            breakTimeMinutes,
            rushLevel,
            customersSampled,
            receiptTotal,
            reimbursementTotal,
            comments,
            managerNote,
            inventoryData,
        } = validate(manualRecapSchema, await request.json());

        const assignment = await prisma.jobAssignment.findUnique({
            where: { id: assignmentId },
            include: {
                worker: true,
                recap: true,
                job: { include: { store: true } },
            },
        });

        if (!assignment) {
            throw new AppError("Assignment not found", 404);
        }

        if (user.role === "MARKET_MANAGER" && assignment.job?.store?.marketId !== user.managedMarketId) {
            throw new AppError("Forbidden — this shift is outside your managed market", 403);
        }

        if (assignment.status !== "RECAP_PENDING") {
            throw new AppError(
                `Cannot manually enter a recap — assignment status is '${assignment.status}', expected 'RECAP_PENDING'`,
                400
            );
        }

        if (assignment.recap && assignment.recap.status !== "REJECTED") {
            throw new AppError(
                "This assignment already has a recap — use the approve/reject flow instead of manual entry",
                400
            );
        }

        // Resolve effective clock-in/out/break — admin-provided values win, otherwise
        // whatever is already on the assignment (mirrors the approve route's "effective
        // value" logic so a partial correction, e.g. clockOut only, still recomputes hours).
        const newClockIn = clockInRaw ? new Date(clockInRaw) : assignment.clockIn;
        const newClockOut = clockOutRaw ? new Date(clockOutRaw) : assignment.clockOut;
        const newBreakMinutes = breakTimeMinutes !== undefined ? breakTimeMinutes : (assignment.breakTimeMinutes ?? 0);

        let newWorkedHours = assignment.workedHours;
        if (newClockIn && newClockOut) {
            const grossMins = (newClockOut.getTime() - newClockIn.getTime()) / 60000;
            newWorkedHours = parseFloat(Math.max(0, (grossMins - newBreakMinutes) / 60).toFixed(2));
        }

        // Build SKU rows the same way the worker's own submit-recap route does.
        const skuData: {
            skuName: string;
            beginningInventory: number;
            purchased: number;
            bottlesSold: number;
            storePrice: number;
        }[] = [];

        if (inventoryData && typeof inventoryData === "object") {
            Object.values(inventoryData).forEach((item: any) => {
                if (item?.name) {
                    skuData.push({
                        skuName: item.name,
                        beginningInventory: parseInt(item.beginning) || 0,
                        purchased: parseInt(item.purchased) || 0,
                        bottlesSold: parseInt(item.sold) || 0,
                        storePrice: parseFloat(item.storePrice) || 0,
                    });
                }
            });
        }

        const oldSnapshot = {
            clockIn: assignment.clockIn,
            clockOut: assignment.clockOut,
            workedHours: assignment.workedHours,
            breakTimeMinutes: assignment.breakTimeMinutes,
        };

        await prisma.$transaction(async (tx: any) => {
            await tx.jobAssignment.update({
                where: { id: assignment.id },
                data: {
                    clockIn: newClockIn,
                    clockOut: newClockOut,
                    breakTimeMinutes: newBreakMinutes,
                    workedHours: newWorkedHours,
                },
            });

            const recapData = {
                consumersAttended: customersSampled,
                consumersSampled: customersSampled,
                reimbursement: reimbursementTotal,
                receiptTotal,
                rushLevel: rushLevel ?? null,
                comments: comments ?? null,
                managerReview: managerNote || `Manually entered by ${user.name} from a paper recap.`,
                status: "PENDING",
                // Same convention as the worker submit-recap route — a manually-entered
                // recap is still a submission awaiting separate admin approval.
                submittedAt: new Date(),
            };

            if (assignment.recap) {
                // Existing REJECTED recap — update it rather than creating a duplicate
                // (assignment.recap is unique per assignment; mirrors the worker route).
                await tx.recap.update({
                    where: { id: assignment.recap.id },
                    data: {
                        ...recapData,
                        skus: { deleteMany: {}, create: skuData },
                    },
                });
            } else {
                await tx.recap.create({
                    data: {
                        ...recapData,
                        jobId: assignment.jobId,
                        assignmentId: assignment.id,
                        skus: { create: skuData },
                    },
                });
            }

            await tx.job.update({
                where: { id: assignment.jobId },
                data: { status: "RECAP_PENDING" },
            });

            await tx.auditLog.create({
                data: {
                    actorId: user.id,
                    action: "RECAP_MANUAL_ENTRY",
                    entityType: "JobAssignment",
                    entityId: assignment.id,
                    oldValue: JSON.stringify(oldSnapshot),
                    newValue: JSON.stringify({
                        clockIn: newClockIn,
                        clockOut: newClockOut,
                        workedHours: newWorkedHours,
                        breakTimeMinutes: newBreakMinutes,
                        customersSampled,
                        skus: skuData,
                    }),
                },
            });
        });

        return NextResponse.json({ success: true, message: "Recap entered — now pending review" });
    } catch (error) {
        return handleApiError(error);
    }
}
