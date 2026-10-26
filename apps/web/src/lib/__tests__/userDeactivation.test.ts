import { describe, it, expect, vi } from "vitest";

// isRemovableFutureShift is pure; the module imports the Prisma client at load.
vi.mock("@/lib/prisma", () => ({ default: {} }));

import { isRemovableFutureShift } from "@/lib/userDeactivation";
import { scheduledShiftEnd } from "@/lib/shiftClose";

const day = (s: string) => new Date(`${s}T00:00:00.000Z`);
const store = (timezone: string) => ({ store: { timezone }, market: null });

describe("isRemovableFutureShift", () => {
    // 2026-10-26 15:00 in Chicago
    const now = new Date("2026-10-26T20:00:00Z");

    it("removes today's and future shifts, keeps past ones", () => {
        const job = store("America/Chicago");
        expect(isRemovableFutureShift({ date: day("2026-10-26"), isRecurring: false, job }, now)).toBe(true);
        expect(isRemovableFutureShift({ date: day("2026-10-30"), isRecurring: true, job }, now)).toBe(true);
        expect(isRemovableFutureShift({ date: day("2026-10-25"), isRecurring: false, job }, now)).toBe(false);
    });

    it("removes undated recurring templates but not undated one-offs", () => {
        const job = store("America/Chicago");
        expect(isRemovableFutureShift({ date: null, isRecurring: true, job }, now)).toBe(true);
        expect(isRemovableFutureShift({ date: null, isRecurring: false, job }, now)).toBe(false);
    });

    it("decides 'today' in each store's own timezone", () => {
        // 00:30 Oct 27 in Chicago, still 23:30 Oct 26 in Denver
        const lateNight = new Date("2026-10-27T05:30:00Z");
        const oct26 = day("2026-10-26");
        expect(isRemovableFutureShift({ date: oct26, isRecurring: false, job: store("America/Denver") }, lateNight)).toBe(true);
        expect(isRemovableFutureShift({ date: oct26, isRecurring: false, job: store("America/Chicago") }, lateNight)).toBe(false);
    });

    it("falls back to the market timezone, then Central", () => {
        const lateNight = new Date("2026-10-27T05:30:00Z");
        const oct26 = day("2026-10-26");
        expect(isRemovableFutureShift({ date: oct26, isRecurring: false, job: { store: null, market: { timezone: "America/Denver" } } }, lateNight)).toBe(true);
        expect(isRemovableFutureShift({ date: oct26, isRecurring: false, job: { store: null, market: null } }, lateNight)).toBe(false);
    });
});

describe("scheduledShiftEnd", () => {
    const base = { id: "a", jobId: "j", customStartTimeStr: null, customEndTimeStr: null, breaks: [] };

    it("uses the store timezone", () => {
        const end = scheduledShiftEnd({ ...base, date: day("2026-10-26"), clockIn: new Date("2026-10-26T14:00:00Z"),
            job: { startTimeStr: "09:00", endTimeStr: "17:00", store: { timezone: "America/Denver" } } });
        expect(end.toISOString()).toBe("2026-10-26T23:00:00.000Z"); // 17:00 MDT
    });

    it("rolls an overnight shift into the next day", () => {
        const end = scheduledShiftEnd({ ...base, date: day("2026-10-26"), clockIn: new Date("2026-10-27T03:00:00Z"),
            job: { startTimeStr: "22:00", endTimeStr: "02:00", store: { timezone: "America/Chicago" } } });
        expect(end.toISOString()).toBe("2026-10-27T07:00:00.000Z"); // 02:00 CDT next day
    });

    it("prefers the assignment's custom times", () => {
        const end = scheduledShiftEnd({ ...base, customEndTimeStr: "12:00", date: day("2026-10-26"), clockIn: new Date("2026-10-26T14:00:00Z"),
            job: { startTimeStr: "09:00", endTimeStr: "17:00", store: { timezone: "America/Chicago" } } });
        expect(end.toISOString()).toBe("2026-10-26T17:00:00.000Z");
    });

    it("never ends before clock-in on bad data (falls back to clockIn + duration)", () => {
        // Dated a day earlier than the actual clock-in
        const clockIn = new Date("2026-10-27T14:00:00Z");
        const end = scheduledShiftEnd({ ...base, date: day("2026-10-26"), clockIn,
            job: { startTimeStr: "09:00", endTimeStr: "17:00", store: { timezone: "America/Chicago" } } });
        expect(end.getTime() - clockIn.getTime()).toBe(8 * 3600 * 1000);
    });
});
