import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { validate, messageSchema } from "@/lib/validate";
import sanitizeHtml from "sanitize-html";

/** Strip all HTML from a string — MAJ-14 fix */
function sanitize(content: string): string {
    return sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} });
}

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request);

        const threads = await prisma.chatThread.findMany({
            where: {
                participants: { some: { id: user.id } }
            },
            include: {
                participants: { select: { id: true, name: true, role: true } },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    include: { sender: { select: { id: true, name: true } } }
                }
            }
        });

        return NextResponse.json(threads);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();

        // Validate input — MIN-10 (length limit) + MAJ-14 (XSS)
        const { content: rawContent, threadId, recipientId, type } =
            validate(messageSchema, body);

        // Sanitize message content — MAJ-14
        const content = sanitize(rawContent);

        if (!threadId && !recipientId && !type) {
            throw new AppError("Thread, recipient, or type required", 400);
        }

        let finalThreadId = threadId;

        // ── Resolve or create thread ──────────────────────────────────────────

        if (!finalThreadId && recipientId) {
            const existingThread = await prisma.chatThread.findFirst({
                where: {
                    AND: [
                        { participants: { some: { id: user.id } } },
                        { participants: { some: { id: recipientId } } },
                        { type: "DIRECT" }
                    ]
                }
            });

            if (existingThread) {
                finalThreadId = existingThread.id;
            } else {
                const newThread = await prisma.chatThread.create({
                    data: {
                        type: "DIRECT",
                        participants: {
                            connect: [{ id: user.id }, { id: recipientId }]
                        }
                    }
                });
                finalThreadId = newThread.id;
            }
        }

        if (!finalThreadId && type && type !== "DIRECT") {
            const existingTypeThread = await prisma.chatThread.findFirst({
                where: {
                    type,
                    participants: { some: { id: user.id } }
                }
            });

            if (existingTypeThread) {
                finalThreadId = existingTypeThread.id;
            } else {
                const manager = await prisma.user.findFirst({
                    where: { role: type === "ADMIN" ? "ADMIN" : type }
                });

                const newThread = await prisma.chatThread.create({
                    data: {
                        type,
                        participants: {
                            connect: manager
                                ? [{ id: user.id }, { id: manager.id }]
                                : [{ id: user.id }]
                        }
                    }
                });
                finalThreadId = newThread.id;
            }
        }

        if (!finalThreadId) {
            throw new AppError("Could not find or create thread", 400);
        }

        // ── CRIT-06: Verify user is a participant of the target thread ────────
        const thread = await prisma.chatThread.findUnique({
            where: { id: finalThreadId },
            select: { participants: { select: { id: true } } }
        });

        if (!thread) {
            throw new AppError("Thread not found", 404);
        }

        const isParticipant = thread.participants.some((p: { id: string }) => p.id === user.id);
        if (!isParticipant) {
            throw new AppError("Forbidden — you are not a participant in this thread", 403);
        }

        // ── Insert message ────────────────────────────────────────────────────
        const message = await prisma.message.create({
            data: { threadId: finalThreadId, senderId: user.id, content },
            include: { sender: { select: { id: true, name: true } } }
        });

        return NextResponse.json(message);
    } catch (error) {
        return handleApiError(error);
    }
}
