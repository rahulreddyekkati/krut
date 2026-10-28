import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Recap.receiptUrl is a JSON array of strings. Each entry is either a legacy base64 data-URI
// (how every client still uploads, and how old rows are stored) or an "s3:<key>" reference to
// a private object in the receipts bucket. Storing images inline bloated the database to over
// 1 GB, so the server moves them to S3 on submit; clients never see the "s3:" form — reads go
// through resolveReceiptUrls, which swaps each reference for a short-lived signed URL.

const S3_PREFIX = "s3:";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

const BUCKET = process.env.RECEIPTS_BUCKET || "kruto-recap-receipts-378656857904";
const REGION = process.env.RECEIPTS_BUCKET_REGION || process.env.AWS_REGION || "us-east-2";

// On in production; locally only when a bucket is configured explicitly, so dev runs don't
// write into the production bucket.
const ENABLED = process.env.NODE_ENV === "production" || !!process.env.RECEIPTS_BUCKET;

let client: S3Client | null = null;
function s3(): S3Client {
    if (!client) client = new S3Client({ region: REGION });
    return client;
}

export function parseReceiptList(receiptUrl: string | null | undefined): string[] {
    if (!receiptUrl) return [];
    try {
        const parsed = JSON.parse(receiptUrl);
        if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === "string" && v.length > 0);
    } catch {
        // Legacy single data-URI string, not JSON.
    }
    return [receiptUrl];
}

// Sniff the real image type: some clients label PNG bytes as image/jpeg.
function detectContentType(bytes: Buffer, declared: string): { contentType: string; ext: string } {
    if (bytes[0] === 0xff && bytes[1] === 0xd8) return { contentType: "image/jpeg", ext: "jpg" };
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { contentType: "image/png", ext: "png" };
    if (bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return { contentType: "image/webp", ext: "webp" };
    if (bytes.subarray(4, 12).toString("ascii").startsWith("ftyphei")) return { contentType: "image/heic", ext: "heic" };
    return { contentType: declared || "application/octet-stream", ext: "bin" };
}

async function uploadDataUri(dataUri: string, keyPrefix: string): Promise<string> {
    const match = /^data:([^;,]*)(?:;[^,]*)?;base64,([\s\S]*)$/.exec(dataUri);
    if (!match) return dataUri; // Not base64 data — leave as-is.
    const bytes = Buffer.from(match[2], "base64");
    const { contentType, ext } = detectContentType(bytes, match[1]);
    const key = `${keyPrefix}/${randomUUID()}.${ext}`;
    await s3().send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: bytes, ContentType: contentType }));
    return S3_PREFIX + key;
}

/**
 * Moves any data-URI images in a receiptUrl value to S3 and returns the value with those
 * entries replaced by "s3:<key>" references. An image that fails to upload stays inline,
 * so a receipt is never lost because S3 is unreachable or misconfigured.
 */
export async function offloadReceipts(
    receiptUrl: string | null | undefined,
    keyPrefix: string
): Promise<string | null | undefined> {
    if (!ENABLED || !receiptUrl) return receiptUrl;
    const entries = parseReceiptList(receiptUrl);
    if (!entries.some((e) => e.startsWith("data:"))) return receiptUrl;

    const stored = await Promise.all(
        entries.map(async (entry) => {
            if (!entry.startsWith("data:")) return entry;
            try {
                return await uploadDataUri(entry, keyPrefix);
            } catch (err) {
                console.error("[receiptStorage] S3 upload failed, keeping receipt inline:", err);
                return entry;
            }
        })
    );
    return JSON.stringify(stored);
}

/** Returns a receiptUrl value clients can render: "s3:" references become signed URLs. */
export async function resolveReceiptUrls(receiptUrl: string | null | undefined): Promise<string | null | undefined> {
    if (!receiptUrl) return receiptUrl;
    const entries = parseReceiptList(receiptUrl);
    if (!entries.some((e) => e.startsWith(S3_PREFIX))) return receiptUrl;

    const resolved = await Promise.all(
        entries.map((entry) =>
            entry.startsWith(S3_PREFIX)
                ? getSignedUrl(s3(), new GetObjectCommand({ Bucket: BUCKET, Key: entry.slice(S3_PREFIX.length) }), {
                      expiresIn: SIGNED_URL_TTL_SECONDS,
                  })
                : entry
        )
    );
    return JSON.stringify(resolved);
}
