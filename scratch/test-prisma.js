const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("Testing with id: undefined");
    const m1 = await prisma.market.findMany({
        where: { id: undefined }
    });
    console.log("Found markets:", m1.length);

    console.log("Testing with id: null");
    const m2 = await prisma.market.findMany({
        where: { id: null }
    });
    console.log("Found markets:", m2.length);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
