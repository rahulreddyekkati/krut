import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { importStores, StoreImportRow } from "@/lib/csv-service";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { rows }: { rows: StoreImportRow[] } = await request.json();

        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ error: "No data provided" }, { status: 400 });
        }

        const results = await importStores(rows);

        return NextResponse.json(results);
    } catch (error) {
        console.error("CSV Import error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
