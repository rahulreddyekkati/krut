import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const libsql = createClient({
  url: process.env.DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

async function run() {
    console.log("--- DB AUDIT: JOB TIMES FOR WORKER TWO ---");
    
    const result = await libsql.execute(`
        SELECT a.id, j.startTimeStr, j.endTimeStr, a.clockIn, a.clockOut, a.workedHours
        FROM JobAssignment a
        JOIN Job j ON a.jobId = j.id
        JOIN User u ON a.workerId = u.id
        WHERE u.name = 'Worker Two'
        ORDER BY a.clockIn DESC
        LIMIT 1
    `);

    console.table(result.rows);
}

run().catch(console.error).finally(() => process.exit(0));
