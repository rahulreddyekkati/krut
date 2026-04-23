import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const libsql = createClient({
  url: process.env.DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

async function run() {
    console.log("--- UNDO ERRONEOUS AUTO-CLOCK-OUT ---");
    
    // Assignment ID for Worker Two from previous audit
    const aid = 'cmoasmjv20003l104kpq2hvat';
    
    // 1. Get Job ID
    const fetch = await libsql.execute({
        sql: "SELECT jobId FROM JobAssignment WHERE id = ?",
        args: [aid]
    });
    const jid = fetch.rows[0]?.jobId;

    if (!jid) {
        console.error("Assignment not found");
        return;
    }

    // 2. Perform Undo
    await libsql.batch([
        {
            sql: "UPDATE JobAssignment SET clockOut = NULL, workedHours = NULL, status = 'IN_PROGRESS' WHERE id = ?",
            args: [aid]
        },
        {
            sql: "UPDATE Job SET status = 'IN_PROGRESS' WHERE id = ?",
            args: [jid]
        }
    ]);

    console.log("✅ RESET SUCCESSFUL. Worker Two is now Clocked In again.");
}

run().catch(console.error).finally(() => process.exit(0));
