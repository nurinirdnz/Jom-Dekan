import { z } from 'zod';
import { FIELDS_OF_STUDY } from '../constants/fieldsOfStudy';

export const updateProfileFormSchema = z.object({
  displayName: z.string().trim().min(2, 'Enter at least 2 characters.').max(120),
  email: z.string().trim().email('Enter a valid email address.'),
  phone: z.string().trim().min(5, 'Enter a valid phone number.').max(30),
  academicRole: z.enum(['STUDENT', 'TUTOR']),
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
});
export type UpdateProfileFormValues = z.infer<typeof updateProfileFormSchema>;
