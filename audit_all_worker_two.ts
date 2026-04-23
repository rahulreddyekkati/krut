import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const libsql = createClient({
  url: process.env.DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

async function run() {
    console.log("--- DB AUDIT: WORKER TWO ALL CURRENT ASSIGNMENTS ---");
    
    const result = await libsql.execute(`
        SELECT a.id, a.date, a.status, a.clockIn, a.clockOut, a.isRecurring, a.dayOfWeek,
               j.title, s.name as store_name
        FROM JobAssignment a
        JOIN Job j ON a.jobId = j.id
        JOIN Store s ON j.storeId = s.id
        JOIN User u ON a.workerId = u.id
        WHERE u.name = 'Worker Two'
        ORDER BY a.date ASC, a.createdAt ASC
    `);

    console.table(result.rows.map(row => ({
        id: row.id,
        date: row.date,
        worker_status: row.status,
        type: row.isRecurring ? `Recurring (Day ${row.dayOfWeek})` : 'Specific',
        clockIn: row.clockIn,
        job: row.title,
        store: row.store_name
    })));
}

run().catch(console.error).finally(() => process.exit(0));
