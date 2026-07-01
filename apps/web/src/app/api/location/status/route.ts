import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST /api/location/status — called by the mobile background location task
// Stores whether the worker is currently inside or outside their store geofence.
// Intentionally minimal: just a status flag + timestamp, open for future admin dashboard use.
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { inStore } = body;

        if (typeof inStore !== "boolean") {
            return NextResponse.json({ error: "inStore must be a boolean" }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { inStore, lastLocationAt: new Date() }
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Location status error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
