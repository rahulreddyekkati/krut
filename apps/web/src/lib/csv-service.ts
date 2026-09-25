import prisma from "./prisma";
import { STORE_CHAINS, guessChainFromName, type StoreChain } from "./storeChain";
import { validateTimezone } from "./timezone";

export interface StoreImportRow {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    marketName: string;
    chain?: string;
    timezone?: string;
}

export async function importStores(rows: StoreImportRow[]) {
    const results = {
        success: 0,
        failed: 0,
        errors: [] as string[]
    };

    for (const row of rows) {
        try {
            // Find or create market
            let market = await prisma.market.findUnique({
                where: { name: row.marketName }
            });

            if (!market) {
                market = await prisma.market.create({
                    data: { name: row.marketName }
                });
            }

            // Explicit column wins if given and valid; otherwise guess from the name so
            // bulk-imported stores aren't left unclassified either (see storeChain.ts).
            const chain: StoreChain = row.chain && (STORE_CHAINS as readonly string[]).includes(row.chain)
                ? (row.chain as StoreChain)
                : guessChainFromName(row.name);

            // Same reasoning as chain above, but for timezone: explicit column wins if given
            // and valid, otherwise fall back to the market's default rather than leaving it
            // to the Store column's own hardcoded default (America/Chicago regardless of
            // market) — that's what silently mistimezoned bulk-imported Mountain-time stores
            // in the past.
            const timezone = row.timezone && validateTimezone(row.timezone) ? row.timezone : market.timezone;

            await prisma.store.create({
                data: {
                    name: row.name,
                    address: row.address,
                    latitude: row.latitude,
                    longitude: row.longitude,
                    marketId: market.id,
                    chain,
                    timezone
                }
            });
            results.success++;
        } catch (error) {
            results.failed++;
            results.errors.push(`Failed to import ${row.name}: ${(error as Error).message}`);
        }
    }

    return results;
}
