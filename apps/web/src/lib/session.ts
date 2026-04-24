// Edge-runtime-safe JWT helpers — no Prisma, no Node.js-only imports.
// Used by middleware (Edge) and re-exported by auth.ts (Node).
import { SignJWT, jwtVerify } from "jose";

const getKey = () => new TextEncoder().encode(process.env.JWT_SECRET ?? "");

export async function encrypt(payload: any): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(getKey());
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, getKey(), { algorithms: ["HS256"] });
    return payload;
}
