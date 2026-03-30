const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash("password123", 10);

    console.log("Seeding Markets...");
    const cali = await prisma.market.upsert({
        where: { name: "California" },
        update: {},
        create: { name: "California" },
    });
    const ny = await prisma.market.upsert({
        where: { name: "New York" },
        update: {},
        create: { name: "New York" },
    });

    console.log("Seeding Stores...");
    const storeA = await prisma.store.upsert({
        where: { id: "store-a" },
        update: {},
        create: {
            id: "store-a",
            name: "Store A",
            address: "123 Apple St",
            latitude: 34.0522,
            longitude: -118.2437,
            marketId: cali.id,
        },
    });
    const storeB = await prisma.store.upsert({
        where: { id: "store-b" },
        update: {},
        create: {
            id: "store-b",
            name: "Store B",
            address: "456 Orange St",
            latitude: 36.7783,
            longitude: -119.4179,
            marketId: cali.id,
        },
    });
    const storeC = await prisma.store.upsert({
        where: { id: "store-c" },
        update: {},
        create: {
            id: "store-c",
            name: "Store C",
            address: "789 Grape St",
            latitude: 40.7128,
            longitude: -74.0060,
            marketId: ny.id,
        },
    });

    console.log("Seeding Admin...");
    const admin = await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: { password: hashedPassword },
        create: {
            email: "admin@example.com",
            password: hashedPassword,
            name: "System Admin",
            role: "ADMIN",
            status: "ACTIVE",
        },
    });

    console.log("Seeding Market Manager...");
    await prisma.user.upsert({
        where: { email: "market@example.com" },
        update: { password: hashedPassword },
        create: {
            email: "market@example.com",
            password: hashedPassword,
            name: "California Market Manager",
            role: "MARKET_MANAGER",
            status: "ACTIVE",
            marketId: cali.id,
        },
    });

    console.log("Seeding Sample Workers...");
    await prisma.user.upsert({
        where: { email: "worker1@example.com" },
        update: {},
        create: {
            email: "worker1@example.com",
            password: hashedPassword,
            name: "Worker One",
            role: "WORKER",
            status: "ACTIVE",
            hourlyWage: 20,
            marketId: cali.id,
        },
    });

    await prisma.user.upsert({
        where: { email: "worker2@example.com" },
        update: {},
        create: {
            email: "worker2@example.com",
            password: hashedPassword,
            name: "Worker Two",
            role: "WORKER",
            status: "ACTIVE",
            hourlyWage: 22,
            marketId: cali.id,
        },
    });

    console.log("Seeding Sample Jobs...");
    const jobsData = [
        {
            title: "Main Shift",
            startTimeStr: "09:00",
            endTimeStr: "17:00",
            storeId: storeA.id,
            marketId: cali.id,
            status: "ACTIVE",
            creatorId: admin.id
        },
        {
            title: "Evening Shift",
            startTimeStr: "17:00",
            endTimeStr: "23:00",
            storeId: storeA.id,
            marketId: cali.id,
            status: "ACTIVE",
            creatorId: admin.id
        }
    ];

    for (const jobData of jobsData) {
        await prisma.job.upsert({
            where: { title: jobData.title },
            update: jobData,
            create: jobData,
        });
    }

    console.log("Seed successful!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
