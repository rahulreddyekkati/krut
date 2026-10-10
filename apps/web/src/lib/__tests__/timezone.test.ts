import { describe, expect, it } from "vitest";
import {
    COMPANY_TZ,
    localShiftEndToUTC,
    localTimeToUTC,
    parseDateMarker,
    resolveStoreTimezone,
    resolveTimezone,
    storeToday,
    toLocalDateStr,
    toUTCLocalDateStr,
} from "@/lib/timezone";
import { formatStoreTime, fromStoreDatetimeLocal, toStoreDatetimeLocal } from "@/lib/storeTime";

// These must give the same answers whatever zone the server itself runs in — the suite
// is run under TZ=UTC, TZ=America/Chicago and TZ=America/New_York (see `npm run test:tz`).

const CENTRAL = "America/Chicago";
const EASTERN = "America/New_York";
const MOUNTAIN = "America/Denver";
const PACIFIC = "America/Los_Angeles";

const req = (headers: Record<string, string>) => ({ headers: new Headers(headers) }) as any;

describe("resolveStoreTimezone", () => {
    it("prefers the store, then the market, then the company zone", () => {
        expect(resolveStoreTimezone({ timezone: EASTERN }, { timezone: CENTRAL })).toBe(EASTERN);
        expect(resolveStoreTimezone({ timezone: null }, { timezone: MOUNTAIN })).toBe(MOUNTAIN);
        expect(resolveStoreTimezone(null, null)).toBe(COMPANY_TZ);
    });
});

describe("resolveTimezone", () => {
    it("uses a valid x-timezone header", () => {
        expect(resolveTimezone(req({ "x-timezone": MOUNTAIN }), CENTRAL)).toBe(MOUNTAIN);
    });

    it("falls back to the supplied zone, then the company zone, when the header is missing or invalid", () => {
        expect(resolveTimezone(req({}), EASTERN)).toBe(EASTERN);
        expect(resolveTimezone(req({ "x-timezone": "undefined" }), MOUNTAIN)).toBe(MOUNTAIN);
        expect(resolveTimezone(req({}))).toBe(COMPANY_TZ);
    });

    it("never guesses from the numeric offset", () => {
        // 360 is Mountain daylight time as well as Central standard time; 300 is Eastern
        // standard time as well as Central daylight time.
        expect(resolveTimezone(req({ "x-timezone-offset": "360" }), MOUNTAIN)).toBe(MOUNTAIN);
        expect(resolveTimezone(req({ "x-timezone-offset": "300" }), EASTERN)).toBe(EASTERN);
    });
});

describe("shift day at the store", () => {
    // 05:30 UTC on Oct 2: already Oct 2 in Eastern and Central, still Oct 1 in Mountain
    // and Pacific (an 11:30 PM clock-in in Denver).
    const instant = new Date("2026-10-02T05:30:00.000Z");

    it("toLocalDateStr gives each store's own calendar day", () => {
        expect(toLocalDateStr(instant, EASTERN)).toBe("2026-10-02");
        expect(toLocalDateStr(instant, CENTRAL)).toBe("2026-10-02");
        expect(toLocalDateStr(instant, MOUNTAIN)).toBe("2026-10-01");
        expect(toLocalDateStr(instant, PACIFIC)).toBe("2026-10-01");
    });

    it("storeToday returns that day as a UTC-midnight marker", () => {
        expect(storeToday(MOUNTAIN, instant).toISOString()).toBe("2026-10-01T00:00:00.000Z");
        expect(storeToday(EASTERN, instant).toISOString()).toBe("2026-10-02T00:00:00.000Z");
    });

    it("toUTCLocalDateStr reads a marker back as the same day", () => {
        expect(toUTCLocalDateStr(new Date("2026-10-01T00:00:00.000Z"))).toBe("2026-10-01");
    });
});

describe("localTimeToUTC", () => {
    it("places a 7:00 PM shift end at the right instant in each zone", () => {
        expect(localTimeToUTC("2026-10-02", "19:00", EASTERN).toISOString()).toBe("2026-10-02T23:00:00.000Z");
        expect(localTimeToUTC("2026-10-02", "19:00", CENTRAL).toISOString()).toBe("2026-10-03T00:00:00.000Z");
        expect(localTimeToUTC("2026-10-02", "19:00", MOUNTAIN).toISOString()).toBe("2026-10-03T01:00:00.000Z");
        expect(localTimeToUTC("2026-10-02", "19:00", PACIFIC).toISOString()).toBe("2026-10-03T02:00:00.000Z");
    });

    it("follows the end of daylight saving on Nov 1, 2026", () => {
        expect(localTimeToUTC("2026-10-31", "15:00", MOUNTAIN).toISOString()).toBe("2026-10-31T21:00:00.000Z");
        expect(localTimeToUTC("2026-11-01", "15:00", MOUNTAIN).toISOString()).toBe("2026-11-01T22:00:00.000Z");
        expect(localTimeToUTC("2026-10-31", "15:00", EASTERN).toISOString()).toBe("2026-10-31T19:00:00.000Z");
        expect(localTimeToUTC("2026-11-01", "15:00", EASTERN).toISOString()).toBe("2026-11-01T20:00:00.000Z");
    });

    it("follows the start of daylight saving on Mar 14, 2027", () => {
        expect(localTimeToUTC("2027-03-13", "15:00", EASTERN).toISOString()).toBe("2027-03-13T20:00:00.000Z");
        expect(localTimeToUTC("2027-03-14", "15:00", EASTERN).toISOString()).toBe("2027-03-14T19:00:00.000Z");
        expect(localTimeToUTC("2027-03-13", "15:00", MOUNTAIN).toISOString()).toBe("2027-03-13T22:00:00.000Z");
        expect(localTimeToUTC("2027-03-14", "15:00", MOUNTAIN).toISOString()).toBe("2027-03-14T21:00:00.000Z");
    });
});

describe("localShiftEndToUTC", () => {
    it("ends a day shift on the shift date", () => {
        expect(localShiftEndToUTC("2026-10-02", "15:00", "19:00", MOUNTAIN).toISOString()).toBe("2026-10-03T01:00:00.000Z");
    });

    it("ends an overnight shift on the next day", () => {
        expect(localShiftEndToUTC("2026-10-02", "22:00", "06:00", EASTERN).toISOString()).toBe("2026-10-03T10:00:00.000Z");
    });
});

describe("parseDateMarker", () => {
    it("turns a calendar day into a UTC-midnight marker", () => {
        expect(parseDateMarker("2026-10-02").toISOString()).toBe("2026-10-02T00:00:00.000Z");
    });

    it("keeps the day and drops the time of an ISO string", () => {
        expect(parseDateMarker("2026-10-02T05:00:00.000Z").toISOString()).toBe("2026-10-02T00:00:00.000Z");
        expect(parseDateMarker("2026-10-02T23:30:00-05:00").toISOString()).toBe("2026-10-02T00:00:00.000Z");
    });

    it("rejects anything else", () => {
        expect(() => parseDateMarker("10/02/2026")).toThrow();
        expect(() => parseDateMarker("2026-13-45")).toThrow();
    });
});

describe("storeTime display helpers", () => {
    const iso = "2026-10-02T21:00:00.000Z"; // 5 PM Eastern, 3 PM Mountain

    it("formats in the store's zone with its abbreviation", () => {
        expect(formatStoreTime(iso, EASTERN)).toMatch(/5:00.*EDT/);
        expect(formatStoreTime(iso, MOUNTAIN)).toMatch(/3:00.*MDT/);
        expect(formatStoreTime(null, EASTERN)).toBe("--");
    });

    it("round-trips a datetime-local value through the store's zone", () => {
        expect(toStoreDatetimeLocal(iso, EASTERN)).toBe("2026-10-02T17:00");
        expect(toStoreDatetimeLocal(iso, MOUNTAIN)).toBe("2026-10-02T15:00");
        expect(fromStoreDatetimeLocal("2026-10-02T17:00", EASTERN)).toBe(iso);
        expect(fromStoreDatetimeLocal(toStoreDatetimeLocal(iso, PACIFIC), PACIFIC)).toBe(iso);
    });
});
