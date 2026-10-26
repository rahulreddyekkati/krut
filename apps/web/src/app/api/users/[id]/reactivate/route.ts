import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";
import { reactivateUser } from "@/lib/userDeactivation";

// POST /api/users/[id]/reactivate - Restore a deactivated account's access
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await requireAuth(request, ["ADMIN"]);
        const { id } = await context.params;
        await reactivateUser(id, admin.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
