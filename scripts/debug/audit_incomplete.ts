import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const libsql = createClient({
  url: process.env.DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

async function run() {
    console.log("--- DB AUDIT: WHY IS INCOMPLETE EMPTY? ---");
    
    // Check all RECAP_PENDING assignments and their associated stores/markets
    const result = await libsql.execute(`
        SELECT a.id, a.date, a.status, u.name as worker_name, s.name as store_name, m.name as market_name, m.id as market_id,
               r.id as recap_id, r.status as recap_status
        FROM JobAssignment a
        JOIN User u ON a.workerId = u.id
        JOIN Job j ON a.jobId = j.id
        JOIN Store s ON j.storeId = s.id
        JOIN Market m ON s.marketId = m.id
        LEFT JOIN Recap r ON a.id = r.assignmentId
        WHERE a.status = 'RECAP_PENDING'
    `);

    console.table(result.rows.map(row => ({
        worker: row.worker_name,
        date: row.date,
        store: row.store_name,
        market: row.market_name,
        market_id: row.market_id,
        recap: row.recap_id ? `EXISTS (${row.recap_status})` : 'MISSING'
    })));
}

run().catch(console.error).finally(() => process.exit(0));
