import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
    token: z.string().min(1, "Invite token is required"),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    name: z.string().min(1, "Name is required").max(100),
});

// ─── Invites ─────────────────────────────────────────────────────────────────

export const inviteSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["ADMIN", "MARKET_MANAGER", "WORKER"]),
    marketId: z.string().optional(),
    hourlyWage: z.number().min(0, "Hourly wage must be non-negative").optional(),
});

// ─── Stores ──────────────────────────────────────────────────────────────────

export const storeSchema = z.object({
    name: z.string().min(1, "Store name is required").max(200),
    address: z.string().min(1, "Address is required"),
    latitude: z
        .number()
        .min(-90, "Latitude must be ≥ -90")
        .max(90, "Latitude must be ≤ 90"),
    longitude: z
        .number()
        .min(-180, "Longitude must be ≥ -180")
        .max(180, "Longitude must be ≤ 180"),
    marketId: z.string().min(1, "Market ID is required"),
    radius: z
        .number()
        .min(10, "Geofence radius must be at least 10 meters")
        .default(100),
});

// ─── Jobs ────────────────────────────────────────────────────────────────────

export const jobSchema = z.object({
    title: z.string().min(1, "Title is required").max(200),
    storeId: z.string().min(1, "Store ID is required"),
    startTime: z
        .string()
        .regex(/^\d{2}:\d{2}$/, "startTime must be HH:MM format"),
    endTime: z
        .string()
        .regex(/^\d{2}:\d{2}$/, "endTime must be HH:MM format"),
    date: z.string().nullable().optional(),
    bonus: z.number().min(0).default(0),
});

// ─── Clock In ────────────────────────────────────────────────────────────────

export const clockInSchema = z.object({
    latitude: z
        .number()
        .min(-90)
        .max(90),
    longitude: z
        .number()
        .min(-180)
        .max(180),
    timezone: z.string().optional(),
});

export const clockOutSchema = z.object({
    action: z.literal("CLOCK_OUT"),
    assignmentId: z.string().min(1),
    breakMinutes: z.number().int().min(0).default(0),
});

// ─── Recaps ──────────────────────────────────────────────────────────────────

const skuItemSchema = z.object({
    name: z.string().min(1),
    beginning: z
        .union([z.number(), z.string()])
        .transform(Number)
        .pipe(z.number().int().min(0, "Beginning inventory cannot be negative")),
    purchased: z
        .union([z.number(), z.string()])
        .transform(Number)
        .pipe(z.number().int().min(0, "Purchased cannot be negative")),
    sold: z
        .union([z.number(), z.string()])
        .transform(Number)
        .pipe(z.number().int().min(0, "Bottles sold cannot be negative")),
    storePrice: z
        .union([z.number(), z.string()])
        .transform(Number)
        .pipe(z.number().min(0, "Store price cannot be negative")),
}).superRefine((data, ctx) => {
    if (data.sold > data.beginning + data.purchased) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Bottles sold (${data.sold}) cannot exceed beginning inventory (${data.beginning}) + purchased (${data.purchased})`,
            path: ["sold"],
        });
    }
});

const MAX_BASE64_BYTES = 2 * 1024 * 1024; // 2MB

export const recapSchema = z.object({
    jobId: z.string().min(1, "jobId is required"),
    assignmentId: z.string().optional(),
    rushLevel: z.string().optional(),
    customersSampled: z
        .union([z.number(), z.string()])
        .transform(Number)
        .pipe(z.number().int().min(0)),
    receiptTotal: z
        .union([z.number(), z.string()])
        .transform(Number)
        .pipe(z.number().min(0)),
    reimbursementTotal: z
        .union([z.number(), z.string()])
        .transform(Number)
        .pipe(z.number().min(0)),
    customerFeedback: z.string().max(2000).optional(),
    receiptUrl: z
        .string()
        .optional()
        .refine(
            (val) => {
                if (!val) return true;
                // Check base64 payload size
                const base64Data = val.split(",").pop() || val;
                const sizeBytes = Math.ceil((base64Data.length * 3) / 4);
                return sizeBytes <= MAX_BASE64_BYTES;
            },
            { message: "Receipt image must be under 2MB" }
        ),
    inventoryData: z.record(z.string(), z.any()).optional(),
});

// ─── Messages ────────────────────────────────────────────────────────────────

export const messageSchema = z.object({
    content: z
        .string()
        .min(1, "Message cannot be empty")
        .max(2000, "Message cannot exceed 2000 characters"),
    threadId: z.string().optional(),
    recipientId: z.string().optional(),
    type: z.string().optional(),
});

// ─── Generic validator ───────────────────────────────────────────────────────

/**
 * Parse and validate data against a Zod schema.
 * Throws a ZodError on failure — handleApiError() catches it and returns 400.
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
}
