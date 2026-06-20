import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve('../../.env') });

const libsql = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

const stores = [
  { name: "Total Wine & More - Littleton",       address: "5136 S Wadsworth Blvd, Littleton, CO 80123",          lat: 39.5847, lng: -105.0813 },
  { name: "Total Wine & More - Centennial",      address: "9505 E County Line Rd, Centennial, CO 80112",         lat: 39.5641, lng: -104.8872 },
  { name: "Klix",                                address: "6945 Mesa Ridge Rd, Fountain, CO 80817",              lat: 38.6830, lng: -104.7002 },
  { name: "Woodmen Wine & Liquor",               address: "3502 Hartsel Dr, Colorado Springs, CO 80920",         lat: 38.9443, lng: -104.7230 },
  { name: "Falcon Liquor Outlet",                address: "7344 McLaughlin Rd, Falcon, CO 80831",                lat: 38.9343, lng: -104.5742 },
  { name: "Meridian Ranch Liquors",              address: "11890 Stapleton, Peyton, CO 80831",                   lat: 38.9251, lng: -104.5411 },
  { name: "Cheers Liquor Mart",                  address: "1105 N Circle Drive, Colorado Springs, CO 80909",     lat: 38.8674, lng: -104.7836 },
];

async function main() {
  // Find or create Colorado market
  let market = await prisma.market.findFirst({
    where: { name: { contains: 'Colorado' } }
  });

  if (!market) {
    console.log('⚠️  Colorado market not found. Creating it...');
    market = await prisma.market.create({
      data: { name: 'Colorado' }
    });
    console.log(`✅ Created market: Colorado (${market.id})`);
  } else {
    console.log(`✅ Found market: ${market.name} (${market.id})`);
  }

  console.log('');
  let created = 0, skipped = 0;

  for (const store of stores) {
    const existing = await prisma.store.findFirst({ where: { name: store.name } });
    if (existing) {
      console.log(`⏭  Skipping (exists): ${store.name}`);
      skipped++;
      continue;
    }
    await prisma.store.create({
      data: { name: store.name, address: store.address, latitude: store.lat, longitude: store.lng, radius: 100, marketId: market.id }
    });
    console.log(`✅ Added: ${store.name}`);
    created++;
  }

  console.log(`\n🎉 Done! Created: ${created}, Skipped: ${skipped}`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
