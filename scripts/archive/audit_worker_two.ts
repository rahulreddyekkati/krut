import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const libsql = createClient({
  url: process.env.DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

async function run() {
    console.log("--- DB AUDIT: WORKER TWO SHIFT ---");
    
    // Check Worker Two's assignments for today
    const result = await libsql.execute(`
        SELECT a.id, a.date, a.status, a.clockIn, a.clockOut, a.workedHours, u.name as worker_name, j.startTimeStr, j.endTimeStr
        FROM JobAssignment a
        JOIN User u ON a.workerId = u.id
        JOIN Job j ON a.jobId = j.id
        WHERE u.name = 'Worker Two'
        ORDER BY a.clockIn DESC
        LIMIT 3
    `);

    console.table(result.rows.map(row => ({
        id: row.id,
        date: row.date,
        worker: row.worker_name,
        clockIn: row.clockIn,
        clockOut: row.clockOut,
        worked: row.workedHours,
        shiftStart: row.startTimeStr,
        shiftEnd: row.endTimeStr
    })));
}

run().catch(console.error).finally(() => process.exit(0));
