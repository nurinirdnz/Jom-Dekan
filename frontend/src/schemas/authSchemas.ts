import { z } from 'zod';
import { FIELDS_OF_STUDY } from '../constants/fieldsOfStudy';

// Shared strength rule for every place a user sets/resets a password —
// kept in sync with backend/src/validators/authValidators.ts.
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.');

export const registerFormSchema = z.object({
  displayName: z.string().trim().min(2, 'Enter at least 2 characters.').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: passwordSchema,
  academicRole: z.enum(['STUDENT', 'TUTOR'], {
    errorMap: () => ({ message: 'Select whether you are a Student or a Tutor.' }),
  }),
  universityId: z.string().uuid('Select your university.'),
  fieldOfStudy: z.enum(FIELDS_OF_STUDY, {
    errorMap: () => ({ message: 'Select your field of study.' }),
  }),
  currentYear: z.coerce
    .number()
    .int('Enter a whole number.')
    .min(1, 'Must be at least 1.')
    .max(8, 'Must be 8 or less.'),
  currentSemester: z.coerce
    .number()
    .int('Enter a whole number.')
    .min(1, 'Must be at least 1.')
    .max(10, 'Must be 10 or less.'),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms & Conditions to continue.' }),
  }),
});
export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const forgotPasswordFormSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const resetPasswordFormSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
