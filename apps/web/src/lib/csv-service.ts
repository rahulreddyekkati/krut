import prisma from "./prisma";
import { STORE_CHAINS, guessChainFromName, type StoreChain } from "./storeChain";

export interface StoreImportRow {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    marketName: string;
    chain?: string;
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

            await prisma.store.create({
                data: {
                    name: row.name,
                    address: row.address,
                    latitude: row.latitude,
                    longitude: row.longitude,
                    marketId: market.id,
                    chain
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
