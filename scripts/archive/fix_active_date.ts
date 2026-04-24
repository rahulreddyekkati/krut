import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const libsql = createClient({
  url: process.env.DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

async function run() {
    console.log("--- FINAL SURGICAL RECOVERY: WORKER TWO ---");
    
    // 1. Find the currently clocked-in assignment
    const result = await libsql.execute(`
        SELECT a.id, a.date, a.workerId, u.name
        FROM JobAssignment a
        JOIN User u ON a.workerId = u.id
        WHERE u.name = 'Worker Two' AND a.clockIn IS NOT NULL AND a.clockOut IS NULL
        LIMIT 1
    `);

    const active = result.rows[0];
    if (!active) {
        console.log("No active assignment found to fix.");
        return;
    }

    console.log(`Fixing Assignment ${active.id} (currently ${active.date})`);

    // 2. Move it to April 22
    await libsql.execute({
        sql: "UPDATE JobAssignment SET date = '2026-04-22T05:00:00+00:00' WHERE id = ?",
        args: [active.id as string]
    });

    console.log("✅ Assignment moved to Wednesday, April 22.");
}

run().catch(console.error).finally(() => process.exit(0));
