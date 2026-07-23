import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("./apps/web/.env") });

const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
    const cols = await libsql.execute(`PRAGMA table_info("JobAssignment")`);
    const hasCol = cols.rows.some((r) => r.name === "brandAllocation");
    if (hasCol) {
        console.log("Column 'brandAllocation' already exists on JobAssignment — nothing to do.");
        return;
    }
    await libsql.execute(`ALTER TABLE "JobAssignment" ADD COLUMN "brandAllocation" TEXT`);
    console.log("Added 'brandAllocation' column to JobAssignment.");

    const check = await libsql.execute(`PRAGMA table_info("JobAssignment")`);
    console.log("Confirmed columns:", check.rows.map((r) => r.name));
}

main().catch((e) => console.error("ERROR:", e));
