import fs from "fs";

function main() {
    const html = fs.readFileSync("/Users/rahulreddyekkati/.gemini/antigravity/brain/5a34422a-6048-43b3-a1a5-074f343d3336/.system_generated/steps/1850/content.md", "utf-8");
    
    console.log("=== SCANNING FOR ALL SHEET NAMES AND GIDS ===");
    
    // Google Sheets JSON format contains: [id, 0, "gid", [{"1":[[0,0,"SheetName"]...]]
    // Let's use a regex to find all instances of sheet names followed by or preceded by their gids.
    // e.g. \"([^\"]+)\" followed by some brackets and numbers
    const sheetNames = ["January", "February", "March", "April", "May", "June", "July", "DATA", "Field Team"];
    
    sheetNames.forEach(name => {
        // Find index of \"[Name]\"
        let idx = -1;
        while (true) {
            idx = html.indexOf(`\\"${name}\\"`, idx + 1);
            if (idx === -1) break;
            
            // Print 150 chars before and after to inspect the structure
            const start = Math.max(0, idx - 150);
            const end = Math.min(html.length, idx + 150);
            console.log(`\nFound "${name}" at index ${idx}:`);
            console.log(html.substring(start, end).replace(/\n/g, ' '));
        }
    });
}

main();
