import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getSession();

    if (!session) {
        // Clear a stale cookie (e.g. the account was deactivated). Otherwise middleware,
        // which only checks that the cookie exists, bounces /login back to /dashboard and
        // the client loops between them.
        const res = NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        res.cookies.set("session", "", { expires: new Date(0) });
        return res;
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
