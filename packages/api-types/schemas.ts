import { z } from "zod";

export const ShiftRequestSchema = z.object({
  action: z.enum(["ACCEPT", "RELEASE"]),
  jobId: z.string(),
  assignmentId: z.string().optional(),
  reason: z.string().optional(),
  date: z.string().optional()
});

export type ShiftRequestDto = z.infer<typeof ShiftRequestSchema>;
