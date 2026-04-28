import { NextResponse } from "next/server";
import { getCurrentCycleDates, getCycleDisplayName } from "@/lib/cycles";

export async function GET() {
    const cycle = getCurrentCycleDates();
    return NextResponse.json({
        start: cycle.start.toISOString(),
        end: cycle.end.toISOString(),
        label: getCycleDisplayName(cycle),
    });
}
