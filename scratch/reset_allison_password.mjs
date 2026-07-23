import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";

dotenv.config({ path: path.resolve("./apps/web/.env") });

const prismaClientSingleton = () => {
    const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;

    if (tursoUrl && (tursoUrl.startsWith("libsql://") || tursoUrl.startsWith("https://"))) {
        const libsql = createClient({
            url: tursoUrl,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });
        const adapter = new PrismaLibSQL(libsql);
        return new PrismaClient({ adapter });
    }

    return new PrismaClient();
};

const prisma = prismaClientSingleton();

async function main() {
    console.log("=== RESETTING PASSWORD FOR ALLISON DOMANIC ===");
    
    // Find Allison
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { name: { contains: "Allison" } },
                { name: { contains: "Domanic" } }
            ]
        }
    });

    if (!user) {
        console.log("User not found matching 'Allison' or 'Domanic'");
        return;
    }

    console.log(`Found user: ${user.name} (${user.email}), current hashed password length: ${user.password.length}`);

    // Hash the new password "password123"
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("password123", saltRounds);

    // Update password
    const updatedUser = await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            password: hashedPassword
        }
    });

    console.log("Password updated successfully!");
    console.log("New hashed password:", updatedUser.password);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
