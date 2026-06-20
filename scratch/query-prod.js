const { createClient } = require("@libsql/client");

const client = createClient({
  url: "libsql://krute-rahulreddyekkati.aws-us-east-2.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzQ4MzU3MTksImlkIjoiMDE5ZDNjNmMtZmMwMS03NmJlLTliNzgtYTczZGQ2NGUxYzBkIiwicmlkIjoiNmM4ODE2ZDgtOTljZS00M2UyLThjY2ItNGFiMDY2ZTlhY2JiIn0.gCa_AgiO5Tt--_qSA0PP_fzWtB4AFQQugjD3LtaSLyVX4mm1GyfCefaCqZvKpmS_O8UNpRV3zQVec5wy9HLmBg"
});

async function main() {
    console.log("Querying production users...");
    const users = await client.execute("SELECT id, email, role, marketId, managedMarketId FROM User");
    console.log(JSON.stringify(users.rows, null, 2));

    console.log("\nQuerying production markets...");
    const markets = await client.execute("SELECT id, name FROM Market");
    console.log(JSON.stringify(markets.rows, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => client.close());
