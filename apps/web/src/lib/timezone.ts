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
 * Resolve the timezone from a request.
 * Reads `x-timezone` header first (IANA string), validates it,
 * falls back to computing from `x-timezone-offset`, and ultimately to "UTC".
 */
export function resolveTimezone(request: NextRequest): string {
    const headerTz = request.headers.get("x-timezone");

    if (headerTz && validateTimezone(headerTz)) {
        return headerTz;
    }

    if (headerTz) {
        console.warn(`⚠️ Invalid x-timezone header: "${headerTz}", falling back`);
    } else {
        console.warn("⚠️ Missing x-timezone header, falling back");
    }

    // Fallback: try to derive from numeric offset (imprecise but better than nothing)
    const offsetStr = request.headers.get("x-timezone-offset");
    if (offsetStr) {
        const offset = parseInt(offsetStr);
        if (!isNaN(offset)) {
            // Common US offsets → IANA mapping
            const offsetMap: Record<number, string> = {
                300: "America/Chicago",   // CDT/CST
                360: "America/Chicago",   // CST
                240: "America/New_York",  // EDT
                420: "America/Denver",    // MDT
                480: "America/Los_Angeles", // PDT
            };
            if (offsetMap[offset]) {
                console.warn(`⚠️ Using offset-based fallback: ${offset} → ${offsetMap[offset]}`);
                return offsetMap[offset];
            }
        }
    }

    console.warn("⚠️ Missing or invalid timezone pulse, defaulting to America/Chicago");
    return "America/Chicago";
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
