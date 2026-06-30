import fs from "fs";

// Time range helper
function getDayName(dateStr) {
    const d = new Date(dateStr);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[d.getDay()];
}

function getJulyDates() {
    const dates = [];
    // July 2026 dates (Jul 1 to Jul 31)
    for (let day = 1; day <= 31; day++) {
        dates.push(`7/${day}/2026`);
    }
    return dates;
}

function main() {
    // Define the June weekly pattern template based on the most frequent June occurrences,
    // plus the user's corrections.
    const weeklyTemplate = [
        // WEDNESDAYS
        { day: "Wednesday", store: "Total Wine 501", time: "2:00 PM - 6:00 PM", worker: "Hector Gonzalez" }, // User corrected
        { day: "Wednesday", store: "Total Wine 502", time: "3:00 PM - 7:00 PM", worker: "Craig Stadler" },
        { day: "Wednesday", store: "Total Wine 506", time: "3:00 PM - 7:00 PM", worker: "Wilfred Obi" },
        { day: "Wednesday", store: "Total Wine 521", time: "3:00 PM - 7:30 PM", worker: "Ashley Bryant" },
        { day: "Wednesday", store: "Total Wine 523", time: "3:00 PM - 7:00 PM", worker: "Justine Donovan" },
        { day: "Wednesday", store: "Total Wine 528", time: "3:00 PM - 7:00 PM", worker: "John Purdy" },
        { day: "Wednesday", store: "Total Wine 534", time: "3:00 PM - 7:00 PM", worker: "Kenneth Alexa" },

        // THURSDAYS
        { day: "Thursday", store: "Total Wine 501", time: "1:00 PM - 7:00 PM", worker: "Justine Donovan" },
        { day: "Thursday", store: "Total Wine 502", time: "3:00 PM - 8:00 PM", worker: "Craig Stadler" },
        { day: "Thursday", store: "Total Wine 505", time: "2:00 PM - 8:00 PM", worker: "Dora Vasquez" },
        { day: "Thursday", store: "Total Wine 506", time: "1:00 PM - 7:00 PM", worker: "Wilfred Obi" },
        { day: "Thursday", store: "Total Wine 507", time: "4:30 PM - 8:30 PM", worker: "Allison Dominac" },
        { day: "Thursday", store: "Total Wine 508", time: "3:00 PM - 8:00 PM", worker: "Craig Stadler" },
        { day: "Thursday", store: "Total Wine 511", time: "4:00 PM - 7:00 PM", worker: "Calynn Dalessio" },
        { day: "Thursday", store: "Total Wine 513", time: "1:00 PM - 7:00 PM", worker: "Sherry Seabaugh" },
        { day: "Thursday", store: "Total Wine 521", time: "2:30 PM - 8:00 PM", worker: "Ashley Bryant" },
        { day: "Thursday", store: "Total Wine 523", time: "1:00 PM - 7:00 PM", worker: "Lori Dedes" },
        { day: "Thursday", store: "Total Wine 528", time: "1:00 PM - 7:00 PM", worker: "John Purdy" },
        { day: "Thursday", store: "Total Wine 534", time: "3:00 PM - 8:00 PM", worker: "Kenneth Alexa" },
        { day: "Thursday", store: "WB Liquors 29 (Costco)", time: "1:00 PM - 6:00 PM", worker: "Daniel King" },
        { day: "Thursday", store: "WB Liquors 30 (Costco)", time: "12:00 PM - 5:00 PM", worker: "Stephanie Pizana" }, // User corrected

        // FRIDAYS
        { day: "Friday", store: "Total Wine 501", time: "12:00 PM - 7:00 PM", worker: "Justine Donovan" },
        { day: "Friday", store: "Total Wine 502", time: "1:00 PM - 7:00 PM", worker: "Craig Stadler" },
        { day: "Friday", store: "Total Wine 506", time: "12:00 PM - 7:00 PM", worker: "Wilfred Obi" },
        { day: "Friday", store: "Total Wine 528", time: "12:00 PM - 7:00 PM", worker: "John Purdy" },
        { day: "Friday", store: "Total Wine 535", time: "1:00 PM - 8:00 PM", worker: "Kenneth Alexa" },
        { day: "Friday", store: "WB Liquors 29 (Costco)", time: "12:00 PM - 6:00 PM", worker: "Open" },
        { day: "Friday", store: "WB Liquors 30 (Costco)", time: "12:00 PM - 6:00 PM", worker: "LaNiece O'Steen" },

        // SATURDAYS
        { day: "Saturday", store: "Total Wine 506", time: "11:00 AM - 6:00 PM", worker: "Wilfred Obi" },
        { day: "Saturday", store: "Total Wine 528", time: "11:00 AM - 6:00 PM", worker: "John Purdy" },
        { day: "Saturday", store: "Total Wine 535", time: "11:00 AM - 5:00 PM", worker: "Kenneth Alexa" },
        { day: "Saturday", store: "WB Liquors 29 (Costco)", time: "2:00 PM - 7:00 PM", worker: "LaNiece O'Steen" }
    ];

    const julyDates = getJulyDates();
    const generatedShifts = [];

    julyDates.forEach(dateStr => {
        const dayOfWeek = getDayName(dateStr);
        // Find all templates matching this day of the week
        const templates = weeklyTemplate.filter(t => t.day === dayOfWeek);
        
        templates.forEach(t => {
            generatedShifts.push({
                date: dateStr,
                day: dayOfWeek,
                store: t.store,
                time: t.time,
                worker: t.worker
            });
        });
    });

    console.log("=== GENERATED JULY 2026 SCHEDULE FROM JUNE PATTERNS ===");
    console.log(`Total Shifts Generated: ${generatedShifts.length}`);
    
    // Group by Date to print nicely
    const dateGroups = {};
    generatedShifts.forEach(s => {
        if (!dateGroups[s.date]) dateGroups[s.date] = [];
        dateGroups[s.date].push(s);
    });

    for (const [date, list] of Object.entries(dateGroups)) {
        console.log(`\nDate: ${date} (${list[0].day})`);
        list.forEach(s => {
            console.log(`  - Store: ${s.store.padEnd(25)} | Worker: ${s.worker.padEnd(20)} | Time: ${s.time}`);
        });
    }
}

main();
