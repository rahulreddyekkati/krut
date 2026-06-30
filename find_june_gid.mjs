import fs from "fs";

function main() {
    const html = fs.readFileSync("/Users/rahulreddyekkati/.gemini/antigravity/brain/5a34422a-6048-43b3-a1a5-074f343d3336/.system_generated/steps/1850/content.md", "utf-8");
    
    console.log("=== SCANNING FOR JUNE GID ===");
    
    // Search for "June" matches in JSON payload
    let idx = -1;
    while (true) {
        idx = html.indexOf('"June"', idx + 1);
        if (idx === -1) break;
        
        const start = Math.max(0, idx - 150);
        const end = Math.min(html.length, idx + 150);
        console.log(`Match at index ${idx}:`);
        console.log(html.substring(start, end).replace(/\n/g, ' '));
    }
}

main();
