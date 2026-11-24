import { z } from "zod";

export const createGoalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Goal name is required" })
    .max(100, { message: "Goal name must not exceed 100 characters" }),
  targetAmountKobo: z
    .number({ message: "targetAmountKobo must be a valid number in kobo" })
    .min(1000, { message: "Target amount must be at least 1,000 kobo (10 NGN)" }),
  currency: z.string().trim().length(3).toUpperCase().optional().default("NGN"),
  targetDate: z.coerce.date().refine((d) => d > new Date(), {
    message: "Target date must be in the future",
  }),
  autoSave: z
    .object({
      enabled: z.boolean().default(false),
      amountKobo: z.number().min(0).default(0),
      frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).default("MONTHLY"),
    })
    .optional(),
});

export const updateGoalSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  targetAmountKobo: z.number().min(1000).optional(),
  targetDate: z.coerce.date().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
  autoSave: z
    .object({
      enabled: z.boolean().optional(),
      amountKobo: z.number().min(0).optional(),
      frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).optional(),
    })
    .optional(),
});

export const depositToGoalSchema = z.object({
  amountKobo: z
    .number({ message: "amountKobo must be a number" })
    .min(100, { message: "Minimum deposit is 100 kobo (1 NGN)" }),
  source: z.enum(["WALLET", "SIMULATED_CARD"]).optional().default("WALLET"),
  reason: z.string().trim().max(100).optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type DepositToGoalInput = z.infer<typeof depositToGoalSchema>;
