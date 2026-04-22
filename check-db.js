require("dotenv").config();
const { createClient } = require("@libsql/client");

const libsql = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
    const assignments = await libsql.execute(`
        SELECT a.id, a.date, a.clockIn, a.clockOut, a.workedHours, j.startTimeStr, j.endTimeStr, j.title
        FROM JobAssignment a 
        JOIN Job j ON a.jobId = j.id 
        WHERE a.clockOut IS NOT NULL
        ORDER BY a.clockOut DESC LIMIT 5
    `);
    console.log("Recent clocked-out assignments:");
    assignments.rows.forEach(r => console.log(r));
}
main();
