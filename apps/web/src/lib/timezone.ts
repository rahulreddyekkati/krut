import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { startOfDay, endOfDay } from "date-fns";
import { NextRequest } from "next/server";

/**
 * Validate an IANA timezone string.
 * Returns true if the string is a valid IANA timezone identifier.
 */
export function validateTimezone(tz: string): boolean {
    try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
    } catch {
        return false;
    }
}

/**
 * The business's own timezone. Use it only for things that belong to the company rather
 * than to a store: pay-cycle boundaries, payroll "today", admin report windows,
 * "generated on" dates. Anything about a shift uses the store's zone instead — see
 * resolveStoreTimezone. This is the only place the literal should appear.
 */
export const COMPANY_TZ = "America/Chicago";

/**
 * The timezone of whoever sent the request — the `x-timezone` header (an IANA string),
 * else `fallbackTz` (pass the caller's market zone when it is known), else COMPANY_TZ.
 *
 * This is the *viewer's* zone. Never use it to turn a shift's date or times into real
 * instants; that is always the store's zone (resolveStoreTimezone).
 *
 * The numeric `x-timezone-offset` header is deliberately ignored. Every offset is shared
 * by two US zones at some point in the year (360 is both Central standard and Mountain
 * daylight; 300 is both Central daylight and Eastern standard), and guessing from it
 * clocked Mountain workers out an hour early.
 */
export function resolveTimezone(request: NextRequest, fallbackTz?: string | null): string {
    const headerTz = request.headers.get("x-timezone");

    if (headerTz && validateTimezone(headerTz)) {
        return headerTz;
    }

    const fallback = fallbackTz && validateTimezone(fallbackTz) ? fallbackTz : COMPANY_TZ;
    console.warn(`⚠️ ${headerTz ? `Invalid x-timezone header "${headerTz}"` : "Missing x-timezone header"}, using ${fallback}`);
    return fallback;
}

/**
 * Parse a time string like "17:00" into [hour, minute] with validation.
 * Throws on invalid input.
 */
function parseTimeStr(timeStr: string): [number, number] {
    const parts = timeStr.split(":").map(Number);
    const [hour, minute] = parts;

    if (parts.length < 2 || isNaN(hour) || isNaN(minute) || hour > 23 || minute > 59 || hour < 0 || minute < 0) {
        throw new Error(`Invalid time format: "${timeStr}"`);
    }

    return [hour, minute];
}

/**
 * Parse a date string like "2026-04-22" into [year, month, day] with validation.
 */
function parseDateStr(dateStr: string): [number, number, number] {
    const parts = dateStr.split("-").map(Number);
    const [year, month, day] = parts;

    if (parts.length < 3 || isNaN(year) || isNaN(month) || isNaN(day)) {
        throw new Error(`Invalid date format: "${dateStr}"`);
    }

    return [year, month, day];
}

/**
 * Convert a local date + time string to a UTC Date.
 * 
 * Strict contract:
 * - dateStr: "YYYY-MM-DD" (e.g. "2026-04-22")
 * - timeStr: "HH:MM" (e.g. "17:00")
 * - timezone: IANA string (e.g. "America/Chicago")
 * 
 * Returns a Date in UTC that represents that exact local moment.
 */
export function localTimeToUTC(dateStr: string, timeStr: string, timezone: string): Date {
    const [year, month, day] = parseDateStr(dateStr);
    const [hour, minute] = parseTimeStr(timeStr);

    // Construct a Date as if it were in the target timezone
    const localDate = new Date(year, month - 1, day, hour, minute, 0, 0);

    return fromZonedTime(localDate, timezone);
}

/**
 * Convert a shift's end time to UTC, with automatic overnight detection.
 * 
 * If endTimeStr < startTimeStr (e.g. start 22:00, end 06:00),
 * the end time is assumed to be the next calendar day.
 * 
 * This prevents the "clock-out before clock-in" bug.
 */
export function localShiftEndToUTC(
    dateStr: string,
    startTimeStr: string,
    endTimeStr: string,
    timezone: string
): Date {
    const [year, month, day] = parseDateStr(dateStr);
    const [startH, startM] = parseTimeStr(startTimeStr);
    const [endH, endM] = parseTimeStr(endTimeStr);

    let endDay = day;

    // Detect overnight shift: end time is before start time
    if (endH < startH || (endH === startH && endM < startM)) {
        endDay += 1;
    }

    const localEndDate = new Date(year, month - 1, endDay, endH, endM, 0, 0);
    return fromZonedTime(localEndDate, timezone);
}

/**
 * Get the UTC boundaries of "today" for a given timezone.
 * 
 * Follows the strict chain:
 *   UTC now → zoned now → startOfDay(zoned) → back to UTC
 * 
 * Returns { start: Date, end: Date } both in UTC, representing
 * the local day's midnight-to-midnight range.
 */
export function getLocalDayBoundsUTC(timezone: string): { start: Date; end: Date } {
    const nowUtc = new Date();
    const zonedNow = toZonedTime(nowUtc, timezone);

    const zonedStart = startOfDay(zonedNow);
    const zonedEnd = endOfDay(zonedNow);

    return {
        start: fromZonedTime(zonedStart, timezone),
        end: fromZonedTime(zonedEnd, timezone),
    };
}

/**
 * Get a date string in "YYYY-MM-DD" format from a Date,
 * interpreting it in the given timezone.
 */
export function toLocalDateStr(date: Date, timezone: string): string {
    const zoned = toZonedTime(date, timezone);
    const y = zoned.getFullYear();
    const m = String(zoned.getMonth() + 1).padStart(2, "0");
    const d = String(zoned.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/**
 * Get a date string in "YYYY-MM-DD" format from a Date,
 * interpreting it in UTC (ideal for date-only calendar values stored as midnight UTC).
 */
export function toUTCLocalDateStr(date: Date): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/**
 * Resolve the timezone a shift's wall-clock times are in: the store's own timezone,
 * else its market's, else Central. Always read from the database rows — the previous
 * helper guessed from the market *name* and had no Eastern branch at all, so every
 * Florida store was silently treated as Central.
 */
export function resolveStoreTimezone(
    store?: { timezone?: string | null } | null,
    market?: { timezone?: string | null } | null
): string {
    return store?.timezone || market?.timezone || COMPANY_TZ;
}

/**
 * The UTC-midnight calendar marker for "today" at a store — the form every shift date
 * (JobAssignment.date, Job.date) is stored in. Compare shift dates against this, never
 * against real local-midnight bounds (getLocalDayBoundsUTC), which sit hours later.
 */
export function storeToday(timezone: string, now: Date = new Date()): Date {
    return new Date(toLocalDateStr(now, timezone) + "T00:00:00.000Z");
}

// Timezones actually in use across markets/stores today, for the admin Market/Store
// creation & edit dropdowns — keeps the picker to real, relevant options instead of the
// full ~600-entry IANA list. Add to this if a market opens in a new zone.
export const COMMON_US_TIMEZONES: { value: string; label: string }[] = [
    { value: "America/New_York", label: "Eastern (New York)" },
    { value: "America/Chicago", label: "Central (Chicago)" },
    { value: "America/Denver", label: "Mountain (Denver)" },
    { value: "America/Phoenix", label: "Mountain, no DST (Phoenix)" },
    { value: "America/Los_Angeles", label: "Pacific (Los Angeles)" },
    { value: "America/Anchorage", label: "Alaska" },
    { value: "Pacific/Honolulu", label: "Hawaii" },
];

/**
 * Turn a client-supplied calendar day into the stored form: a UTC-midnight marker.
 * Accepts "YYYY-MM-DD" or any ISO string starting with one (the day part is kept, the
 * time part dropped). Never use `new Date(str)` for a shift date — anything other than a
 * bare "YYYY-MM-DD" is parsed in the server's local zone and lands off midnight.
 */
export function parseDateMarker(input: string): Date {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(input);
    const marker = match ? new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z`) : null;
    if (!marker || isNaN(marker.getTime())) {
        throw new Error(`Invalid date: "${input}" (expected YYYY-MM-DD)`);
    }
    return marker;
}
