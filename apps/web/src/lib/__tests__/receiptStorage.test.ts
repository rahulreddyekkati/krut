import { describe, it, expect } from "vitest";
import { parseReceiptList, offloadReceipts, resolveReceiptUrls } from "../receiptStorage";

describe("receiptStorage", () => {
    it("parses JSON arrays, legacy single data-URIs, and empty values", () => {
        expect(parseReceiptList('["data:image/jpeg;base64,AAA","s3:receipts/a/b.jpg"]')).toEqual([
            "data:image/jpeg;base64,AAA",
            "s3:receipts/a/b.jpg",
        ]);
        expect(parseReceiptList("data:image/png;base64,BBB")).toEqual(["data:image/png;base64,BBB"]);
        expect(parseReceiptList("[]")).toEqual([]);
        expect(parseReceiptList(null)).toEqual([]);
    });

    it("leaves receipts inline when S3 offload is disabled (tests / local dev)", async () => {
        const value = '["data:image/jpeg;base64,/9j/AAA"]';
        expect(await offloadReceipts(value, "receipts/x")).toBe(value);
        expect(await offloadReceipts(undefined, "receipts/x")).toBeUndefined();
    });

    it("passes values without s3 references through unchanged on read", async () => {
        const value = '["data:image/jpeg;base64,/9j/AAA"]';
        expect(await resolveReceiptUrls(value)).toBe(value);
        expect(await resolveReceiptUrls(null)).toBeNull();
    });
});
