import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { ZodError } from "zod";

/**
 * Centralized API error handler.
 *
 * - Logs full error details server-side with a unique error ID.
 * - NEVER exposes stack traces, file paths, or DB error details to the client.
 * - Returns a consistent shape: { error: string, errorId?: string }
 */
export function handleApiError(error: unknown): NextResponse {
    // Zod validation errors → 400 with field-level details (safe to expose)
    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                error: "Validation failed",
                issues: error.issues.map((i) => ({
                    field: i.path.join("."),
                    message: i.message,
                })),
            },
            { status: 400 }
        );
    }

    // Known application errors (thrown with a status code attached)
    if (error instanceof AppError) {
        return NextResponse.json(
            { error: error.message },
            { status: error.status }
        );
    }

    // Unknown / unexpected errors — log full details server-side only
    const errorId = randomUUID();
    console.error(`[ERROR ${errorId}]`, error);

    // Prisma unique constraint → 409
    if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as any).code === "P2002"
    ) {
        return NextResponse.json(
            { error: "A record with this value already exists.", errorId },
            { status: 409 }
        );
    }

    // Prisma foreign key constraint
    if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as any).code === "P2003"
    ) {
        return NextResponse.json(
            { error: "Referenced record does not exist.", errorId },
            { status: 400 }
        );
    }

    return NextResponse.json(
        { error: "Internal server error", errorId },
        { status: 500 }
    );
}

/**
 * Structured application error — safe to surface to the client.
 * Use for expected domain errors (e.g. "Already clocked in").
 */
export class AppError extends Error {
    constructor(
        message: string,
        public readonly status: number = 400
    ) {
        super(message);
        this.name = "AppError";
    }
}
