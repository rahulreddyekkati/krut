import fs from "fs";

function main() {
    const html = fs.readFileSync("/Users/rahulreddyekkati/.gemini/antigravity/brain/5a34422a-6048-43b3-a1a5-074f343d3336/.system_generated/steps/1850/content.md", "utf-8");
    
    // Google Sheets bootstrap data usually has a JSON block with:
    // "January", "February", etc. and their corresponding sheet ID (gid).
    // Let's search for "July" and print the next 2000 characters to see if there is any JSON with sheet properties.
    // Also, let's search for any script tags containing "July" or "DATA".
    console.log("=== SCANNING FOR SCRIPT CONTENT ===");
    
    const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let count = 0;
    while ((match = regex.exec(html)) !== null) {
        const script = match[1];
        if (script.includes("July") || script.includes("Field Team")) {
            count++;
            console.log(`\nScript ${count} contains "July" or "Field Team" (Length: ${script.length}):`);
            
            // Search inside this script for numbers and sheet names
            // Let's print out the matches of numbers that might be sheet gids
            const gids = script.match(/\b\d{8,10}\b/g);
            if (gids) {
                console.log("Found potential gids in this script:", Array.from(new Set(gids)));
            }
            
            // Print a snippet around "July" in the script
            const idx = script.indexOf("July");
            console.log("Snippet around 'July':");
            console.log(script.substring(Math.max(0, idx - 150), Math.min(script.length, idx + 300)).replace(/\n/g, ' '));
        }
    }
}

main();
