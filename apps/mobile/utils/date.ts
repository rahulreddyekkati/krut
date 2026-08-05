// Formats a Date as YYYY-MM-DD using its LOCAL calendar components.
//
// Never use `date.toISOString().split('T')[0]` for this. toISOString() reports
// the UTC calendar day, not the local one -- in US timezones that's already
// "tomorrow" for several hours every evening (e.g. after ~7pm CDT), which
// silently sends the wrong date to any endpoint expecting a plain YYYY-MM-DD
// day string (recap lookups, report date ranges, etc.) and makes that day's
// data appear to be missing.
export function toLocalDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
