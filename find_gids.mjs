import fs from "fs";

function main() {
    const html = fs.readFileSync("/Users/rahulreddyekkati/.gemini/antigravity/brain/5a34422a-6048-43b3-a1a5-074f343d3336/.system_generated/steps/1850/content.md", "utf-8");
    
    // Print the entire tab bar HTML segment
    console.log("=== TAB BAR HTML SEGMENT ===");
    console.log(html.substring(304000, 307600));
}

main();
