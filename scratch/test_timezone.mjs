import { resolveTimezone, localTimeToUTC, toLocalDateStr } from "../apps/web/src/lib/timezone.ts";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

// Let's mock a target assignment date
const targetAssignmentDate = new Date("2026-07-09T00:00:00.000Z");
const startTimeStr = "16:00"; // 4pm
const tz = "America/Chicago";

console.log("targetAssignmentDate (UTC):", targetAssignmentDate.toISOString());

// 1. Current logic
const dateStrCurr = toLocalDateStr(targetAssignmentDate, tz);
const shiftStartCurr = localTimeToUTC(dateStrCurr, startTimeStr, tz);
const diffMsCurr = shiftStartCurr.getTime() - new Date("2026-07-09T15:40:58Z").getTime(); // Mock current time 10:40 AM Chicago time (15:40:58 UTC)

console.log("\n--- CURRENT LOGIC ---");
console.log("dateStr:", dateStrCurr);
console.log("shiftStart (UTC):", shiftStartCurr.toISOString());
console.log("diffMs:", diffMsCurr);
console.log("Hours until start:", diffMsCurr / (1000 * 60 * 60));
console.log("Is less than 2 hours?", diffMsCurr < 2 * 60 * 60 * 1000);

// 2. Fixed logic (using UTC getters to format the stored date)
function toUTCLocalDateStr(date) {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

const dateStrFixed = toUTCLocalDateStr(targetAssignmentDate);
const shiftStartFixed = localTimeToUTC(dateStrFixed, startTimeStr, tz);
const diffMsFixed = shiftStartFixed.getTime() - new Date("2026-07-09T15:40:58Z").getTime();

console.log("\n--- FIXED LOGIC ---");
console.log("dateStr:", dateStrFixed);
console.log("shiftStart (UTC):", shiftStartFixed.toISOString());
console.log("diffMs:", diffMsFixed);
console.log("Hours until start:", diffMsFixed / (1000 * 60 * 60));
console.log("Is less than 2 hours?", diffMsFixed < 2 * 60 * 60 * 1000);
