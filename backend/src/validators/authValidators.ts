import { z } from 'zod';

// .strict() rejects unknown fields outright — this is the mass-assignment
// defense (e.g. a client cannot slip `role: "ADMIN"` into a register call).
export const registerSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(128, 'Password is too long.'),
    displayName: z
      .string()
      .trim()
      .min(2, 'Display name must be at least 2 characters.')
      .max(120, 'Display name is too long.'),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
    password: z.string().min(1, 'Password is required.'),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
