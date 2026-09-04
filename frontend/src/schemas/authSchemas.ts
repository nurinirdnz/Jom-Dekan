import { z } from 'zod';

export const registerFormSchema = z.object({
  displayName: z.string().trim().min(2, 'Enter at least 2 characters.').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});
export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;
