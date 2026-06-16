import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";

export async function PUT(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        const { token } = await request.json();

        await prisma.user.update({
            where: { id: user.id },
            data: { expoPushToken: token ?? null },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
