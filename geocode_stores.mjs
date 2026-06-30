import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve('.env') });

const EARTH_RADIUS_METERS = 6_371_000;
function toRad(deg) { return (deg * Math.PI) / 180; }
function haversineDistance(lat1, lon1, lat2, lon2) {
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_METERS * c;
}

const args = process.argv.slice(2);
const commit = args.includes('--commit');
const marketArg = args.find(a => a.startsWith('--market='));
const marketFilter = marketArg ? marketArg.split('=')[1] : 'Dallas,Tx';
const allMarkets = args.includes('--all');
const includeReview = args.includes('--include-review');
const excludeArg = args.find(a => a.startsWith('--exclude='));
const excludeNames = new Set((excludeArg ? excludeArg.split('=')[1] : '').split(',').map(s => s.trim()).filter(Boolean));

const apiKey = process.env.GOOGLE_MAPS_API_KEY;
if (!apiKey) {
    console.error('❌ GOOGLE_MAPS_API_KEY is not set in .env');
    process.exit(1);
}

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;
if (!tursoUrl) {
    console.error('❌ TURSO_DATABASE_URL is not set in .env — this script targets the production database.');
    process.exit(1);
}

const libsql = createClient({ url: tursoUrl, authToken: tursoToken });
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function geocodeAddress(address) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK' || !data.results?.length) {
        return { ok: false, status: data.status, errorMessage: data.error_message };
    }

    const result = data.results[0];
    return {
        ok: true,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        locationType: result.geometry.location_type, // ROOFTOP | RANGE_INTERPOLATED | GEOMETRIC_CENTER | APPROXIMATE
        formattedAddress: result.formatted_address
    };
}

const HIGH_CONFIDENCE = new Set(['ROOFTOP', 'RANGE_INTERPOLATED']);

async function main() {
    const where = allMarkets ? {} : { market: { name: marketFilter } };
    const allStores = await prisma.store.findMany({
        where,
        include: { market: { select: { name: true } } },
        orderBy: { name: 'asc' }
    });
    const stores = allStores.filter(s => !excludeNames.has(s.name));
    const excludedCount = allStores.length - stores.length;

    if (stores.length === 0) {
        console.log(`No stores found for market filter "${marketFilter}". Use --all to run across every market.`);
        await prisma.$disconnect();
        return;
    }

    console.log(`\n${commit ? '⚡ COMMIT MODE' : '🔍 DRY RUN'} — geocoding ${stores.length} store(s)${allMarkets ? ' (all markets)' : ` in market "${marketFilter}"`}${excludedCount > 0 ? ` (excluded ${excludedCount}: ${[...excludeNames].join(', ')})` : ''}\n`);

    const rows = [];
    let needsReview = 0;
    let updated = 0;

    for (const store of stores) {
        const result = await geocodeAddress(store.address);

        if (!result.ok) {
            rows.push({
                name: store.name,
                market: store.market.name,
                status: `FAILED (${result.status})`,
                oldLat: store.latitude.toFixed(6),
                oldLng: store.longitude.toFixed(6),
                newLat: '-',
                newLng: '-',
                distanceM: '-',
                confidence: '-'
            });
            needsReview++;
            continue;
        }

        const distance = haversineDistance(store.latitude, store.longitude, result.lat, result.lng);
        const confident = HIGH_CONFIDENCE.has(result.locationType);

        rows.push({
            name: store.name,
            market: store.market.name,
            status: confident ? 'OK' : 'REVIEW',
            oldLat: store.latitude.toFixed(6),
            oldLng: store.longitude.toFixed(6),
            newLat: result.lat.toFixed(6),
            newLng: result.lng.toFixed(6),
            distanceM: Math.round(distance),
            confidence: result.locationType
        });

        if (!confident) {
            needsReview++;
            if (!includeReview) continue;
        }

        if (commit) {
            await prisma.store.update({
                where: { id: store.id },
                data: { latitude: result.lat, longitude: result.lng }
            });
            updated++;
        }
    }

    console.table(rows);

    console.log(`\nTotal: ${stores.length}  |  High-confidence: ${stores.length - needsReview}  |  Needs manual review: ${needsReview}`);
    if (commit) {
        const skippedNote = includeReview
            ? 'Only failed lookups (if any) were skipped.'
            : 'Low-confidence/failed rows were skipped — re-run with --include-review to apply them too.';
        console.log(`✅ Updated ${updated} store(s) in the database. ${skippedNote}`);
    } else {
        console.log(`\nThis was a dry run — no changes were made. Re-run with --commit to apply high-confidence updates.`);
    }

    await prisma.$disconnect();
}

main().catch(async (err) => {
    console.error('❌ Script failed:', err);
    await prisma.$disconnect();
    process.exit(1);
});
