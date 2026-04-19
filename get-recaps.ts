import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const recaps = await prisma.recap.findMany({
    include: { assignment: true, job: true }
  });
  console.log(JSON.stringify(recaps, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
