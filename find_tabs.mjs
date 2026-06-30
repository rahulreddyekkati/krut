import fs from "fs";

function main() {
    const html = fs.readFileSync("/Users/rahulreddyekkati/.gemini/antigravity/brain/5a34422a-6048-43b3-a1a5-074f343d3336/.system_generated/steps/1850/content.md", "utf-8");
    
    // Look for sheet tab definitions. In Google Sheets HTML, they are often in a script block containing:
    // {"id":"...", "name":"..."} or similar structures, or inside data-id.
    // Let's do regex search for sheet metadata or names.
    // Usually, Google Sheets HTML has a script with: bootstrapData or initialData or similar.
    // Let's search for tab name patterns or strings.
    console.log("=== SCANNING FOR TAB NAMES ===");
    
    // Let's find any mentions of month names like "July", "Jul", "August", "Aug", "June", "Jun", etc.
    const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december", "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    
    months.forEach(m => {
        const regex = new RegExp(`\\b${m}\\b`, 'gi');
        const matches = html.match(regex);
        if (matches) {
            console.log(`Found month word matches for "${m}": ${matches.length}`);
        }
    });

    // Let's print out text matches that look like sheet tab items or JSON lists
    // Search for patterns like "sheetId" or "sheetName" or "gid"
    const gidRegex = /"([^"]+)"\s*,\s*(\d+)\s*,\s*null\s*,\s*0\s*,\s*\[null\s*,\s*\[\s*\d+/g;
    const matches = html.match(/"[^"]*sheet[^"]*"|"[^"]*tab[^"]*"/gi);
    if (matches) {
        console.log(`Found matching sheet/tab strings: ${matches.slice(0, 10)}`);
    }

    // Let's extract any sheet names. Google Sheets HTML contains a list of sheets in a script block under:
    // e.g. {"1": "Sheet1", "2": "Sheet2"}
    // Or in the HTML: id="sheet-button-..."
    const buttonMatches = html.match(/class="[^"]*docs-sheet-tab[^"]*"[^>]*>([^<]+)</g);
    if (buttonMatches) {
        console.log("Found sheet tab buttons in HTML:", buttonMatches);
    } else {
        // Let's look for standard sheet names in raw text or script tags
        const jsonMatch = html.match(/sheetName[^:]*:[^"]*"([^"]+)"/g);
        if (jsonMatch) {
            console.log("Found sheetName matches:", jsonMatch);
        }
    }
}

main();
