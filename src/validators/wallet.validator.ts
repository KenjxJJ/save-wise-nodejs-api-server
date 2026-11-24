import { z } from "zod";

export const fundWalletSchema = z.object({
  amountKobo: z
    .number({ message: "amountKobo must be a valid number in kobo" })
    .min(100, { message: "Minimum funding amount is 100 kobo (1 NGN)" }),
  paymentMethod: z.string().trim().optional().default("CARD"),
  reason: z.string().trim().max(100).optional().default("Wallet Top-up"),
});

export const updateSettingsSchema = z.object({
  targetSavingsPercentage: z
    .number({ message: "targetSavingsPercentage must be a number" })
    .min(1, { message: "Target savings percentage must be at least 1%" })
    .max(100, { message: "Target savings percentage cannot exceed 100%" })
    .optional(),
  monthlyIncomeKobo: z
    .number({ message: "monthlyIncomeKobo must be a number" })
    .min(0, { message: "Monthly income cannot be negative" })
    .optional(),
  currency: z.string().trim().length(3).toUpperCase().optional(),
});

export const withdrawWalletSchema = z.object({
  amountKobo: z
    .number({ message: "amountKobo must be a valid number" })
    .min(100, { message: "Minimum withdrawal amount is 100 kobo (1 NGN)" }),
  destination: z.string().trim().min(1, { message: "Destination account/bank details required" }),
  reason: z.string().trim().max(100).optional(),
});

export type FundWalletInput = z.infer<typeof fundWalletSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type WithdrawWalletInput = z.infer<typeof withdrawWalletSchema>;
