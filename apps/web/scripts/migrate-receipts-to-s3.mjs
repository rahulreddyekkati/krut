// One-time move of inline base64 receipt photos (Recap.receiptUrl) into the private S3
// receipts bucket, rewriting each entry as "s3:<key>" — the format src/lib/receiptStorage.ts
// writes for new submissions. Dry run by default; pass --apply to write.
//
//   cd apps/web && set -a && . ./.env && set +a && node scripts/migrate-receipts-to-s3.mjs [--apply]
//
// Each row is only rewritten after every one of its uploads has been confirmed with a HEAD,
// and the original base64 is kept if anything fails, so the script is safe to re-run.
import { createClient } from "@libsql/client";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const APPLY = process.argv.includes("--apply");
const BUCKET = process.env.RECEIPTS_BUCKET || "kruto-recap-receipts-378656857904";
const REGION = process.env.RECEIPTS_BUCKET_REGION || "us-east-2";
const PAGE = 5; // rows per request — each can carry several MB of base64

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const s3 = new S3Client({ region: REGION });

function detect(bytes, declared) {
    if (bytes[0] === 0xff && bytes[1] === 0xd8) return ["image/jpeg", "jpg"];
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return ["image/png", "png"];
    if (bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return ["image/webp", "webp"];
    if (bytes.subarray(4, 12).toString("ascii").startsWith("ftyphei")) return ["image/heic", "heic"];
    return [declared || "application/octet-stream", "bin"];
}

function parseList(v) {
    try {
        const p = JSON.parse(v);
        if (Array.isArray(p)) return p.filter((x) => typeof x === "string" && x.length > 0);
    } catch {}
    return [v];
}

// Turso reads of multi-MB rows occasionally time out; retry rather than abort the whole run.
async function withRetry(fn, label) {
    for (let attempt = 1; ; attempt++) {
        try {
            return await fn();
        } catch (err) {
            if (attempt >= 5) throw err;
            console.warn(`${label} failed (${err.code || err.message}), retry ${attempt}/4`);
            await new Promise((r) => setTimeout(r, 2000 * attempt));
        }
    }
}

let lastRowid = 0, scanned = 0, rowsToMove = 0, moved = 0, failed = 0, bytesMoved = 0;
for (;;) {
    const { rows } = await withRetry(() => db.execute({
        sql: `SELECT rowid AS rid, id, assignmentId, receiptUrl FROM Recap WHERE rowid > ? ORDER BY rowid LIMIT ${PAGE}`,
        args: [lastRowid],
    }), `read after rowid ${lastRowid}`);
    if (rows.length === 0) break;
    for (const row of rows) {
        lastRowid = Number(row.rid);
        scanned++;
        if (!row.receiptUrl || !String(row.receiptUrl).includes("data:")) continue;
        const entries = parseList(String(row.receiptUrl));
        if (!entries.some((e) => e.startsWith("data:"))) continue;
        rowsToMove++;
        const size = entries.reduce((s, e) => s + (e.startsWith("data:") ? e.length : 0), 0);
        if (!APPLY) {
            console.log(`would move ${row.id}: ${entries.length} image(s), ${(size / 1048576).toFixed(2)} MB`);
            continue;
        }
        try {
            const out = [];
            for (const e of entries) {
                const m = /^data:([^;,]*)(?:;[^,]*)?;base64,([\s\S]*)$/.exec(e);
                if (!m) { out.push(e); continue; }
                const bytes = Buffer.from(m[2], "base64");
                const [contentType, ext] = detect(bytes, m[1]);
                const key = `receipts/${row.assignmentId}/${randomUUID()}.${ext}`;
                await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: bytes, ContentType: contentType }));
                const head = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
                if (head.ContentLength !== bytes.length) throw new Error(`size mismatch for ${key}`);
                out.push("s3:" + key);
            }
            // Only overwrite if the row hasn't changed underneath us (e.g. a resubmission).
            const res = await db.execute({
                sql: "UPDATE Recap SET receiptUrl = ? WHERE id = ? AND receiptUrl = ?",
                args: [JSON.stringify(out), row.id, row.receiptUrl],
            });
            if (res.rowsAffected !== 1) throw new Error("row changed during migration; left as-is");
            moved++;
            bytesMoved += size;
            console.log(`moved ${row.id}: ${out.length} image(s), ${(size / 1048576).toFixed(2)} MB`);
        } catch (err) {
            failed++;
            console.error(`FAILED ${row.id}:`, err.message);
        }
    }
}

console.log(`\n${APPLY ? "APPLIED" : "DRY RUN"}: scanned ${scanned} recaps, ${rowsToMove} with inline receipts` +
    (APPLY ? `, moved ${moved} (${(bytesMoved / 1048576).toFixed(1)} MB of base64), failed ${failed}` : ""));
