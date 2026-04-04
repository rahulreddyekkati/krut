import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { user } = session;

        // Find threads where the user is a participant
        let threads = await prisma.chatThread.findMany({
            where: {
                participants: {
                    some: { id: user.id }
                }
            },
            include: {
                participants: {
                    select: { id: true, name: true, role: true }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: { sender: { select: { id: true, name: true } } }
                }
            }
        });

        // For managers/admins, they might also see specific role-targeted threads 
        // that haven't been "joined" yet, or threads where they are the targets.
        // For now, we'll focus on participants-based threads.

        return NextResponse.json(threads);
    } catch (error) {
        console.error("Messages GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { threadId, recipientId, content, type } = await request.json();
        console.log("Messaging POST:", { threadId, recipientId, content, type, userId: session.user.id });

        if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });
        if (!threadId && !recipientId && !type) return NextResponse.json({ error: "Thread, recipient, or type required" }, { status: 400 });

        let finalThreadId = threadId;

        // If no threadId but we have a recipientId, try to find or create a direct thread
        if (!finalThreadId && recipientId) {
            const existingThread = await prisma.chatThread.findFirst({
                where: {
                    AND: [
                        { participants: { some: { id: session.user.id } } },
                        { participants: { some: { id: recipientId } } },
                        { type: "DIRECT" }
                    ]
                }
            });

            if (existingThread) {
                finalThreadId = existingThread.id;
            } else {
                console.log("Creating new DIRECT thread for:", session.user.id, recipientId);
                const newThread = await prisma.chatThread.create({
                    data: {
                        type: "DIRECT",
                        participants: {
                            connect: [
                                { id: session.user.id },
                                { id: recipientId }
                            ]
                        }
                    }
                });
                finalThreadId = newThread.id;
            }
        }

        // Handle legacy type-based thread creation (e.g. "ADMIN", "MARKET_MANAGER")
        if (!finalThreadId && type && type !== "DIRECT") {
            console.log("Creating/Finding legacy thread of type:", type);
            // In a production app, we'd find the specific manager. 
            // For now, let's look for a thread of this type that the user participates in or create one.
            const existingTypeThread = await prisma.chatThread.findFirst({
                where: {
                    type: type,
                    participants: { some: { id: session.user.id } }
                }
            });

            if (existingTypeThread) {
                finalThreadId = existingTypeThread.id;
            } else {
                // Find an appropriate manager to connect
                const manager = await prisma.user.findFirst({
                    where: { role: type === "ADMIN" ? "ADMIN" : type }
                });

                const newThread = await prisma.chatThread.create({
                    data: {
                        type: type,
                        participants: {
                            connect: manager ? [
                                { id: session.user.id },
                                { id: manager.id }
                            ] : [{ id: session.user.id }]
                        }
                    }
                });
                finalThreadId = newThread.id;
            }
        }

        if (!finalThreadId) {
            console.error("Failed to resolve threadId");
            return NextResponse.json({ error: "Could not find or create thread" }, { status: 400 });
        }

        const message = await prisma.message.create({
            data: {
                threadId: finalThreadId,
                senderId: session.user.id,
                content
            },
            include: {
                sender: { select: { id: true, name: true } }
            }
        });

        return NextResponse.json(message);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
