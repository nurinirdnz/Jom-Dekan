import { z } from 'zod';
import { ALLOWED_MIME_TYPES } from '../utils/fileSniffer';
import { env } from '../config/config/env';

export const fileIdParamSchema = z.object({ fileId: z.string().uuid('Invalid id.') }).strict();

export const createUploadIntentSchema = z
  .object({
    title: z.string().trim().min(2, 'Title must be at least 2 characters.').max(200),
    description: z.string().trim().max(2000).optional(),
    universityId: z.string().uuid().optional(),
    facultyId: z.string().uuid().optional(),
    programmeId: z.string().uuid().optional(),
    subjectId: z.string().uuid().optional(),
    fileName: z.string().trim().min(1).max(255),
    contentType: z.enum(ALLOWED_MIME_TYPES, {
      errorMap: () => ({ message: 'Unsupported file type. Allowed: PDF, JPEG, PNG.' }),
    }),
    sizeBytes: z
      .number()
      .int()
      .positive()
      .max(env.resources.maxFileSizeBytes, 'File is too large.'),
  })
  .strict();

export const updateResourceSchema = z
  .object({
    title: z.string().trim().min(2, 'Title must be at least 2 characters.').max(200),
    description: z.string().trim().max(2000).optional(),
    universityId: z.string().uuid().optional(),
    facultyId: z.string().uuid().optional(),
    programmeId: z.string().uuid().optional(),
    subjectId: z.string().uuid().optional(),
  })
  .strict();

// Not reusing taxonomy's boolean `isActive` — resources have a third
// terminal state (FAILED) that archive/restore never touches.
export const resourceStatusActionSchema = z
  .object({ action: z.enum(['ARCHIVE', 'RESTORE']) })
  .strict();

export const listResourcesQuerySchema = z
  .object({
    // Not z.coerce.boolean(): that's JS `Boolean(str)`, and the string
    // "false" is truthy — mine=false would silently coerce to true.
    mine: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => v === 'true'),
    universityId: z.string().uuid().optional(),
    facultyId: z.string().uuid().optional(),
    programmeId: z.string().uuid().optional(),
    subjectId: z.string().uuid().optional(),
    q: z.string().trim().min(1).max(200).optional(),
    // Allow-listed enum, not a raw column/direction string, so this can
    // only ever map to a fixed, hardcoded SQL fragment in the model.
    sortBy: z.enum(['newest', 'oldest', 'title']).optional().default('newest'),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  })
  .strict();
