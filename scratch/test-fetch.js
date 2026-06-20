async function testDomain(domain, token) {
    const url = `${domain}/api/invites/${token}`;
    console.log(`Fetching: ${url}`);
    try {
        const res = await fetch(url);
        console.log(`[${domain}] Status:`, res.status);
        const body = await res.text();
        console.log(`[${domain}] Body:`, body);
    } catch (err) {
        console.error(`[${domain}] Error:`, err);
    }
}

async function main() {
    const token = "0f807ffae6456042b962c331e96a7cfdf52fe04f85e85467c159da9ba991f936";
    await testDomain("https://krut-6zbd.vercel.app", token);
    await testDomain("https://www.krutotastes.com", token);
}

main();
