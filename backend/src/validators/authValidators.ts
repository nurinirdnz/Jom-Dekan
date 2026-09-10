import { z } from 'zod';
import { FIELDS_OF_STUDY } from '../constants/fieldsOfStudy';

// Shared strength rule for every place a user sets/resets a password.
// Kept in one place so registration and password-reset can never drift.
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password is too long.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.');

// .strict() rejects unknown fields outright — this is the mass-assignment
// defense (e.g. a client cannot slip `role: "ADMIN"` into a register call).
// Note: `academicRole` (STUDENT/TUTOR) is a self-declared profile field,
// unrelated to the system `role` (USER/ADMIN) — that one stays
// deliberately unreachable from this schema.
export const registerSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
    password: passwordSchema,
    displayName: z
      .string()
      .trim()
      .min(2, 'Display name must be at least 2 characters.')
      .max(120, 'Display name is too long.'),
    academicRole: z.enum(['STUDENT', 'TUTOR'], {
      errorMap: () => ({ message: 'Select whether you are registering as a Student or a Tutor.' }),
    }),
    universityId: z.string().uuid('Select a university.'),
    fieldOfStudy: z.enum(FIELDS_OF_STUDY, {
      errorMap: () => ({ message: 'Select your field of study.' }),
    }),
    currentYear: z.coerce
      .number()
      .int('Current year must be a whole number.')
      .min(1, 'Current year must be at least 1.')
      .max(8, 'Current year must be 8 or less.'),
    currentSemester: z.coerce
      .number()
      .int('Current semester must be a whole number.')
      .min(1, 'Current semester must be at least 1.')
      .max(10, 'Current semester must be 10 or less.'),
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the Terms & Conditions to register.' }),
    }),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
    password: z.string().min(1, 'Password is required.'),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required.'),
    newPassword: passwordSchema,
  })
  .strict();

export const verifyEmailSchema = z
  .object({
    token: z.string().min(1, 'Verification token is required.'),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
