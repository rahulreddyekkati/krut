export interface CycleDates {
  start: Date;
  end: Date;
}

// All cycle boundaries are built with Date.UTC(...), not the local-timezone Date
// constructor. JobAssignment.date is stored as a pure UTC-midnight calendar marker (see
// apps/web/src/app/api/admin/reports/payroll/route.ts for the full explanation), and every
// server-side caller here (recurringShifts.ts, users/route.ts, jobs/my-shifts/route.ts,
// users/[id]/assignments/route.ts) compares these boundaries directly against that marker.
// Building them with the local constructor only "worked" because nothing sets a TZ env var
// and the deployed runtime happens to default to UTC — fragile, same class of bug fixed
// elsewhere in the payroll routes. Date.UTC(...) makes it correct regardless of runtime TZ.
//
// The one caller that reads these via local Y/M/D getters to build a display string
// (apps/web/src/app/admin/reports/page.tsx, and getCycleDisplayName below) has been updated
// to use the UTC getters/timeZone instead, so the calendar day shown still matches what was
// requested regardless of the viewer's own browser timezone.

export function getCurrentCycleDates(baseDate: Date = new Date()): CycleDates {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const day = baseDate.getDate();

  if (day <= 15) {
    const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 15, 23, 59, 59, 999));
    return { start, end };
  } else {
    const start = new Date(Date.UTC(year, month, 16, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
    return { start, end };
  }
}

export function getNextCycleDates(baseDate: Date = new Date()): CycleDates {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const day = baseDate.getDate();

  if (day <= 15) {
    // Current is 1st-15th → next is 16th-end of this month
    const start = new Date(Date.UTC(year, month, 16, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
    return { start, end };
  } else {
    // Current is 16th-end → next is 1st-15th of next month
    const start = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month + 1, 15, 23, 59, 59, 999));
    return { start, end };
  }
}

export function getPreviousCycleDates(baseDate: Date = new Date()): CycleDates {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const day = baseDate.getDate();

  if (day <= 15) {
    // Previous was 16th to end of month before
    const prevMonthEnd = new Date(Date.UTC(year, month, 0));
    const start = new Date(Date.UTC(year, month - 1, 16, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month - 1, prevMonthEnd.getUTCDate(), 23, 59, 59, 999));
    return { start, end };
  } else {
    // Previous was 1st to 15th of current month
    const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 15, 23, 59, 59, 999));
    return { start, end };
  }
}

export function getClosedCycles(count: number = 6): (CycleDates & { label: string })[] {
  const cycles = [];
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  // true = first half (1-15), false = second half (16-end)
  let firstHalf: boolean;

  if (now.getDate() <= 15) {
    // Current cycle is first half → most recent closed is second half of previous month
    if (month === 0) { month = 11; year--; } else { month--; }
    firstHalf = false;
  } else {
    // Current cycle is second half → most recent closed is first half of current month
    firstHalf = true;
  }

  for (let i = 0; i < count; i++) {
    let start: Date, end: Date;
    if (firstHalf) {
      start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      end = new Date(Date.UTC(year, month, 15, 23, 59, 59, 999));
    } else {
      start = new Date(Date.UTC(year, month, 16, 0, 0, 0, 0));
      end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
    }
    cycles.push({ start, end, label: getCycleDisplayName({ start, end }) + ` (${year})` });

    // Step back one half-cycle
    if (firstHalf) {
      // First half → previous is second half of prior month
      if (month === 0) { month = 11; year--; } else { month--; }
      firstHalf = false;
    } else {
      // Second half → previous is first half of same month
      firstHalf = true;
    }
  }

  return cycles;
}

export function getCycleDisplayName(dates: CycleDates): string {
  // timeZone: "UTC" is required now that start/end are built with Date.UTC(...) — without
  // it, toLocaleDateString renders in the viewer's own local timezone, which for any
  // browser west of UTC (all US timezones) shows the day *before* the intended one, since
  // e.g. "Jul 16 00:00 UTC" is still "Jul 15 evening" in US local time.
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' };
  return `${dates.start.toLocaleDateString(undefined, options)} - ${dates.end.toLocaleDateString(undefined, options)}`;
}

/**
 * Returns every date in [start, end] whose UTC weekday is in weekdays.
 * weekdays: 0=Sun, 1=Mon, ... 6=Sat
 * Uses UTC methods throughout — start/end come from this file's cycle boundaries (now
 * Date.UTC(...)-anchored) or from other UTC-midnight markers, so mixing in local-timezone
 * mutators/getters here would only coincidentally agree with them on a UTC-TZ runtime.
 */
export function getDatesForWeekdays(weekdays: number[], start: Date, end: Date): Date[] {
  const results: Date[] = [];
  const cursor = new Date(start);
  cursor.setUTCHours(0, 0, 0, 0);
  const finish = new Date(end);
  finish.setUTCHours(23, 59, 59, 999);
  while (cursor <= finish) {
    if (weekdays.includes(cursor.getUTCDay())) {
      results.push(new Date(cursor));
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return results;
}
