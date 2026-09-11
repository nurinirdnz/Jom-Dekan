import { z } from "zod";
import { ALLOWED_RESOURCE_MIME_TYPES, RESOURCE_CATEGORIES } from "../types/resource";

// No .strict() here — that's a backend-only mass-assignment defense.
// The client-side file checks below are UX only; the server always
// re-validates the actual bytes regardless of what this reports.
//
// The file is optional: leaving it empty posts a text-only resource
// (the description becomes the content, mirrored by
// createTextResourceSchema on the backend), so the superRefine below
// requires a real chunk of description whenever no file is attached —
// matching the backend's own 20-character minimum for that path.
export const uploadResourceFormSchema = z
  .object({
    title: z.string().trim().min(2, "Enter at least 2 characters.").max(200),
    description: z.string().trim().max(2000).optional(),
    category: z.enum(RESOURCE_CATEGORIES as [string, ...string[]], {
      errorMap: () => ({ message: "Choose a category." }),
    }),
    universityId: z.string().uuid().optional().or(z.literal("")),
    facultyId: z.string().uuid().optional().or(z.literal("")),
    programmeId: z.string().uuid().optional().or(z.literal("")),
    subjectId: z.string().uuid().optional().or(z.literal("")),
    file: z
      .instanceof(File)
      .refine(
        (file) => (ALLOWED_RESOURCE_MIME_TYPES as readonly string[]).includes(file.type),
        "Only PDF, JPEG, PNG, DOCX, XLSX, or PPTX files are allowed.",
      )
      .refine((file) => file.size <= 20 * 1024 * 1024, "File must be 20MB or smaller.")
      .optional(),
  })
  .superRefine((values, ctx) => {
    if (!values.file && (!values.description || values.description.length < 20)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["description"],
        message: "Write at least 20 characters, or attach a file instead.",
      });
    }
  });
export type UploadResourceFormValues = z.infer<typeof uploadResourceFormSchema>;

export const editResourceFormSchema = z.object({
  title: z.string().trim().min(2, "Enter at least 2 characters.").max(200),
  description: z.string().trim().max(2000).optional(),
});
export type EditResourceFormValues = z.infer<typeof editResourceFormSchema>;
