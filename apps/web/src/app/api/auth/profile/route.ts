import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            marketId: true,
            managedMarketId: true,
            hourlyWage: true,
        }
    });

    if (!user || user.status === "SUSPENDED" || user.status === "DEACTIVATED") {
        return NextResponse.json({ error: "Account inactive" }, { status: 403 });
    }

    return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const { name, password } = await request.json();
        const updateData: Record<string, string> = {};

        if (name && typeof name === "string" && name.trim()) {
            updateData.name = name.trim();
        }
        if (password && typeof password === "string" && password.length >= 8) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        const updated = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: { id: true, email: true, name: true, role: true }
        });

        return NextResponse.json({ user: updated });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
