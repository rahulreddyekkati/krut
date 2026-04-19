require("dotenv").config();
const { createClient } = require("@libsql/client");

const libsql = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
    const jobsInfo = await libsql.execute("PRAGMA table_info(Job)");
    console.log("Job Columns:", jobsInfo.rows.map(r => r.name));
    
    const assignInfo = await libsql.execute("PRAGMA table_info(JobAssignment)");
    console.log("JobAssignment Columns:", assignInfo.rows.map(r => r.name));
}
main();
