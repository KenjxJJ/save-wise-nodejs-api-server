import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address format" }),
  password: z
    .string()
    .regex(passwordRegex, {
      message:
        "Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character",
    }),
  firstName: z
    .string()
    .trim()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name must not exceed 50 characters" }),
  lastName: z
    .string()
    .trim()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name must not exceed 50 characters" }),
  dateOfBirth: z.coerce.date().optional(),
  phoneNumber: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address format" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { message: "Refresh token is required" }),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address format" }),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address format" }),
  otp: z
    .string()
    .trim()
    .length(6, { message: "OTP must be exactly 6 digits" }),
  newPassword: z
    .string()
    .regex(passwordRegex, {
      message:
        "Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character",
    }),
});

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().min(1).max(50).optional(),
  dateOfBirth: z.coerce.date().optional(),
  avatarUrl: z.string().trim().url({ message: "Invalid avatar URL" }).optional().or(z.literal("")),
  phoneNumber: z.string().trim().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
