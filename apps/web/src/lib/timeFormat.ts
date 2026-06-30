/** Converts "HH:MM" 24-hour string to "H:MM AM/PM" 12-hour display. Returns the original string if it's not a valid time (e.g. "--"). */
export function to12hr(time: string): string {
    if (!time || !time.includes(":")) return time;
    const [h, m] = time.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return time;
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}
