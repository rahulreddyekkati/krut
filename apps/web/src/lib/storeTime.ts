import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

// Client-safe helpers for showing and editing a shift's clock times in the *store's*
// timezone. Without a zone these fall back to the viewer's browser zone, which shows an
// admin in Texas a Florida shift an hour early (and saves their edits an hour off).

/** "2:05 PM EDT" — the zone abbreviation is included whenever the store zone is known. */
export function formatStoreTime(iso: string | Date | null | undefined, timeZone?: string | null): string {
    if (!iso) return "--";
    return new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        ...(timeZone ? { timeZone, timeZoneName: "short" as const } : {}),
    });
}

/** Instant -> value for an <input type="datetime-local">, as wall-clock time at the store. */
export function toStoreDatetimeLocal(iso: string | Date | null | undefined, timeZone?: string | null): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (timeZone) return formatInTimeZone(d, timeZone, "yyyy-MM-dd'T'HH:mm");
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** <input type="datetime-local"> value (wall-clock time at the store) -> ISO instant. */
export function fromStoreDatetimeLocal(value: string, timeZone?: string | null): string {
    return (timeZone ? fromZonedTime(value, timeZone) : new Date(value)).toISOString();
}
