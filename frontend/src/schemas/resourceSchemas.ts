import { z } from "zod";
import { ALLOWED_RESOURCE_MIME_TYPES } from "../types/resource";

// No .strict() here — that's a backend-only mass-assignment defense.
// The client-side file checks below are UX only; the server always
// re-validates the actual bytes regardless of what this reports.
export const uploadResourceFormSchema = z.object({
  title: z.string().trim().min(2, "Enter at least 2 characters.").max(200),
  description: z.string().trim().max(2000).optional(),
  universityId: z.string().uuid().optional().or(z.literal("")),
  facultyId: z.string().uuid().optional().or(z.literal("")),
  programmeId: z.string().uuid().optional().or(z.literal("")),
  subjectId: z.string().uuid().optional().or(z.literal("")),
  file: z
    .instanceof(File, { message: "Choose a file to upload." })
    .refine(
      (file) => (ALLOWED_RESOURCE_MIME_TYPES as readonly string[]).includes(file.type),
      "Only PDF, JPEG, or PNG files are allowed.",
    )
    .refine((file) => file.size <= 20 * 1024 * 1024, "File must be 20MB or smaller."),
});
export type UploadResourceFormValues = z.infer<typeof uploadResourceFormSchema>;

export const editResourceFormSchema = z.object({
  title: z.string().trim().min(2, "Enter at least 2 characters.").max(200),
  description: z.string().trim().max(2000).optional(),
});
export type EditResourceFormValues = z.infer<typeof editResourceFormSchema>;
