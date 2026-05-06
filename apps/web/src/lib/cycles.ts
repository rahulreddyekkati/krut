export interface CycleDates {
  start: Date;
  end: Date;
}

export function getCurrentCycleDates(baseDate: Date = new Date()): CycleDates {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const day = baseDate.getDate();

  if (day <= 15) {
    const start = new Date(year, month, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 15, 23, 59, 59, 999);
    return { start, end };
  } else {
    const start = new Date(year, month, 16, 0, 0, 0, 0);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }
}

export function getPreviousCycleDates(baseDate: Date = new Date()): CycleDates {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const day = baseDate.getDate();

  if (day <= 15) {
    // Previous was 16th to end of month before
    const prevMonthEnd = new Date(year, month, 0);
    const start = new Date(year, month - 1, 16, 0, 0, 0, 0);
    const end = new Date(year, month - 1, prevMonthEnd.getDate(), 23, 59, 59, 999);
    return { start, end };
  } else {
    // Previous was 1st to 15th of current month
    const start = new Date(year, month, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 15, 23, 59, 59, 999);
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
      start = new Date(year, month, 1, 0, 0, 0, 0);
      end = new Date(year, month, 15, 23, 59, 59, 999);
    } else {
      start = new Date(year, month, 16, 0, 0, 0, 0);
      end = new Date(year, month + 1, 0, 23, 59, 59, 999);
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
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${dates.start.toLocaleDateString(undefined, options)} - ${dates.end.toLocaleDateString(undefined, options)}`;
}

/**
 * Returns every date in [start, end] whose getDay() is in weekdays.
 * weekdays: 0=Sun, 1=Mon, ... 6=Sat
 */
export function getDatesForWeekdays(weekdays: number[], start: Date, end: Date): Date[] {
  const results: Date[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const finish = new Date(end);
  finish.setHours(23, 59, 59, 999);
  while (cursor <= finish) {
    if (weekdays.includes(cursor.getDay())) {
      results.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return results;
}
