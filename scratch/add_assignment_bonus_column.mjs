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
    const hasBonus = cols.rows.some((r) => r.name === "bonus");
    if (hasBonus) {
        console.log("Column 'bonus' already exists on JobAssignment — nothing to do.");
        return;
    }
    await libsql.execute(`ALTER TABLE "JobAssignment" ADD COLUMN "bonus" REAL`);
    console.log("Added 'bonus' column to JobAssignment.");

    const check = await libsql.execute(`PRAGMA table_info("JobAssignment")`);
    console.log("Confirmed columns:", check.rows.map((r) => r.name));
}

main().catch((e) => console.error("ERROR:", e));
