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
  let currentBase = new Date();
  
  // Start from the most recent closed cycle
  // If today is 16th+, the 1-15 cycle is closed.
  // If today is 1-15, the 16-31 of prev month is closed.
  
  for (let i = 0; i < count; i++) {
    const prev = getPreviousCycleDates(currentBase);
    cycles.push({
      ...prev,
      label: getCycleDisplayName(prev) + ` (${prev.start.getFullYear()})`
    });
    // Move currentBase back to before the start of this cycle to get the next previous
    currentBase = new Date(prev.start.getTime() - 1000);
  }
  
  return cycles;
}

export function getCycleDisplayName(dates: CycleDates): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${dates.start.toLocaleDateString(undefined, options)} - ${dates.end.toLocaleDateString(undefined, options)}`;
}
