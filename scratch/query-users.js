const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("Querying users...");
    const users = await prisma.user.findMany({
        include: {
            market: true,
            managedMarket: true
        }
    });
    console.log(JSON.stringify(users, null, 2));

    console.log("\nQuerying markets...");
    const markets = await prisma.market.findMany();
    console.log(JSON.stringify(markets, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
