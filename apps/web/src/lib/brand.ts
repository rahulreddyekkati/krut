// The brands a job or shift can be for. Job.brand is set when the job is created;
// JobAssignment.brandAllocation is per shift and defaults to its job's brand whenever a
// shift is created without one picked explicitly.

export const BRANDS = ["KRUTO", "MULUK", "BOTH"] as const;
export type Brand = typeof BRANDS[number];

export const BRAND_LABELS: Record<Brand, string> = {
    KRUTO: "Kruto",
    MULUK: "Muluk",
    BOTH: "Both",
};

export function isBrand(v: unknown): v is Brand {
    return typeof v === "string" && (BRANDS as readonly string[]).includes(v);
}

type JobBrandReader = { job: { findUnique: (args: any) => Promise<{ brand: string | null } | null> } };

/** The brand a new shift on this job should get when nobody picked one. */
export async function jobBrandDefault(db: JobBrandReader, jobId: string): Promise<string | null> {
    const job = await db.job.findUnique({ where: { id: jobId }, select: { brand: true } });
    return job?.brand ?? null;
}
