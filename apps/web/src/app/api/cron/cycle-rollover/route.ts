import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureCurrentCycleAssignments } from "@/lib/recurringShifts";

export async function GET(request: NextRequest) {
    const secret = request.headers.get("x-cron-secret");
    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workers = await prisma.user.findMany({
        where: { role: "WORKER", status: "ACTIVE" },
        select: { id: true, name: true }
    });

    let rolled = 0;
    let errors = 0;

    for (const worker of workers) {
        try {
            await ensureCurrentCycleAssignments(worker.id);
            rolled++;
        } catch (e) {
            console.error(`cycle-rollover failed for worker ${worker.id} (${worker.name}):`, e);
            errors++;
        }
    }

    return NextResponse.json({ success: true, workers: workers.length, rolled, errors });
}
