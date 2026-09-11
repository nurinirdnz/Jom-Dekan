import { z } from "zod";
import { ALLOWED_MIME_TYPES } from "../utils/fileSniffer";
import { env } from "../config/config/env";

export const RESOURCE_CATEGORIES = [
  "PAST_PAPER",
  "NOTES",
  "SLIDES",
  "ARTICLE",
  "EXCEL",
] as const;

const categorySchema = z.enum(RESOURCE_CATEGORIES, {
  errorMap: () => ({ message: "Choose a category." }),
});

export const fileIdParamSchema = z
  .object({ fileId: z.string().uuid("Invalid id.") })
  .strict();

export const createUploadIntentSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Title must be at least 2 characters.")
      .max(200),
    description: z.string().trim().max(2000).optional(),
    category: categorySchema,
    universityId: z.string().uuid().optional(),
    facultyId: z.string().uuid().optional(),
    programmeId: z.string().uuid().optional(),
    subjectId: z.string().uuid().optional(),
    fileName: z.string().trim().min(1).max(255),
    contentType: z.enum(ALLOWED_MIME_TYPES, {
      errorMap: () => ({
        message: "Unsupported file type. Allowed: PDF, JPEG, PNG, DOCX, XLSX, PPTX.",
      }),
    }),
    sizeBytes: z
      .number()
      .int()
      .positive()
      .max(env.resources.maxFileSizeBytes, "File is too large."),
  })
  .strict();

// A file-less resource has no bytes to carry the content, so unlike the
// upload-intent path above (where description is optional — the file
// itself is the content), description is required here and held to a
// real minimum length so this can't be used to post an empty listing.
export const createTextResourceSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Title must be at least 2 characters.")
      .max(200),
    description: z
      .string()
      .trim()
      .min(20, "Write at least 20 characters of content.")
      .max(2000),
    category: categorySchema,
    universityId: z.string().uuid().optional(),
    facultyId: z.string().uuid().optional(),
    programmeId: z.string().uuid().optional(),
    subjectId: z.string().uuid().optional(),
  })
  .strict();

export const updateResourceSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Title must be at least 2 characters.")
      .max(200),
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
  .object({ action: z.enum(["ARCHIVE", "RESTORE"]) })
  .strict();

export const listResourcesQuerySchema = z
  .object({
    // Not z.coerce.boolean(): that's JS `Boolean(str)`, and the string
    // "false" is truthy — mine=false would silently coerce to true.
    mine: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => v === "true"),
    universityId: z.string().uuid().optional(),
    facultyId: z.string().uuid().optional(),
    programmeId: z.string().uuid().optional(),
    subjectId: z.string().uuid().optional(),
    category: categorySchema.optional(),
    q: z.string().trim().min(1).max(200).optional(),
    // Allow-listed enum, not a raw column/direction string, so this can
    // only ever map to a fixed, hardcoded SQL fragment in the model.
    sortBy: z.enum(["newest", "oldest", "title"]).optional().default("newest"),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  })
  .strict();
