const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const prisma = new PrismaClient();

async function main() {
    const email = "worker@example.com";
    const hashedPassword = await bcrypt.hash("worker123", 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: "WORKER",
            status: "ACTIVE",
            password: hashedPassword,
        },
        create: {
            email,
            password: hashedPassword,
            name: "Test Worker",
            role: "WORKER",
            status: "ACTIVE",
        },
    });

    console.log("Worker created:", user.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
