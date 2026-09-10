import { z } from 'zod';
import { FIELDS_OF_STUDY } from '../constants/fieldsOfStudy';

// .strict() rejects unknown fields — same mass-assignment defense as
// authValidators. Every field is optional (partial update); role/status
// are deliberately absent, matching registerSchema's exclusion of them.
export const updateProfileSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, 'Display name must be at least 2 characters.')
      .max(120, 'Display name is too long.')
      .optional(),
    academicRole: z.enum(['STUDENT', 'TUTOR']).optional(),
    universityId: z.string().uuid('Select a valid university.').optional(),
    fieldOfStudy: z.enum(FIELDS_OF_STUDY, {
      errorMap: () => ({ message: 'Select a valid field of study.' }),
    }).optional(),
    currentYear: z.coerce
      .number()
      .int('Current year must be a whole number.')
      .min(1, 'Current year must be at least 1.')
      .max(8, 'Current year must be 8 or less.')
      .optional(),
    currentSemester: z.coerce
      .number()
      .int('Current semester must be a whole number.')
      .min(1, 'Current semester must be at least 1.')
      .max(10, 'Current semester must be 10 or less.')
      .optional(),
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
