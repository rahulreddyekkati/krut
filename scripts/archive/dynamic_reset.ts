import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const libsql = createClient({
  url: process.env.DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

async function run() {
    console.log("--- FINAL DYNAMIC RESET: WORKER TWO ---");
    
    // 1. Get the latest specific assignment for Worker Two
    const result = await libsql.execute(`
        SELECT a.id, a.jobId 
        FROM JobAssignment a
        JOIN User u ON a.workerId = u.id
        WHERE u.name = 'Worker Two'
        ORDER BY a.createdAt DESC
        LIMIT 1
    `);

    const active = result.rows[0];
    if (!active) {
        console.log("No assignment found.");
        return;
    }

    const aid = active.id as string;
    const jid = active.jobId as string;

    console.log(`Resetting Assignment ${aid} and Job ${jid}`);

    // 2. Perform Undo
    await libsql.batch([
        {
            sql: "UPDATE JobAssignment SET clockOut = NULL, workedHours = NULL, status = 'IN_PROGRESS', date = '2026-04-22T05:00:00+00:00' WHERE id = ?",
            args: [aid]
        },
        {
            sql: "UPDATE Job SET status = 'IN_PROGRESS' WHERE id = ?",
            args: [jid]
        }
    ]);

    console.log("✅ RESET SUCCESSFUL. Worker should refresh now.");
}

run().catch(console.error).finally(() => process.exit(0));
