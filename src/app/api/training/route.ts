import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // In a real app, you might filter documents by user role or assignments
        // For now, return all training documents
        const docs = await prisma.trainingDocument.findMany({
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(docs);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
