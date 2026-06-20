// Edge-runtime-safe JWT helpers — no Prisma, no Node.js-only imports.
// Used by middleware (Edge) and re-exported by auth.ts (Node).
import { SignJWT, jwtVerify } from "jose";

const getKey = () => new TextEncoder().encode(process.env.JWT_SECRET ?? "");

/**
 * encrypt(payload, expiresIn?)
 * Signs a JWT with the given payload.
 * - Web sessions: default 24h rolling expiry
 * - Mobile sessions: pass "180d" so workers stay logged in for 6 months
 */
export async function encrypt(payload: any, expiresIn: string = "24h"): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(getKey());
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, getKey(), { algorithms: ["HS256"] });
    return payload;
}
