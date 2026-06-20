const { createClient } = require("@libsql/client");

const client = createClient({
  url: "libsql://krute-rahulreddyekkati.aws-us-east-2.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzQ4MzU3MTksImlkIjoiMDE5ZDNjNmMtZmMwMS03NmJlLTliNzgtYTczZGQ2NGUxYzBkIiwicmlkIjoiNmM4ODE2ZDgtOTljZS00M2UyLThjY2ItNGFiMDY2ZTlhY2JiIn0.gCa_AgiO5Tt--_qSA0PP_fzWtB4AFQQugjD3LtaSLyVX4mm1GyfCefaCqZvKpmS_O8UNpRV3zQVec5wy9HLmBg"
});

async function main() {
    console.log("Querying invites in detail...");
    const invites = await client.execute("SELECT id, email, role, expiresAt, token, senderId FROM Invite");
    console.log("Invites:", JSON.stringify(invites.rows, null, 2));

    for (const row of invites.rows) {
        const users = await client.execute({
            sql: "SELECT id, name FROM User WHERE id = ?",
            args: [row.senderId]
        });
        console.log(`Sender for invite ${row.id} (${row.email}):`, JSON.stringify(users.rows, null, 2));
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => client.close());
