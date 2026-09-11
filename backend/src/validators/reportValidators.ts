import { z } from "zod";

export const REPORT_TARGET_TYPES = ["resource", "forum_post", "opportunity"] as const;

export const REPORT_CATEGORIES = [
  "INAPPROPRIATE_CONTENT",
  "COPYRIGHT_VIOLATION",
  "PLAGIARISM",
  "ACADEMIC_DISHONESTY",
  "SPAM_OR_SCAM",
  "HARASSMENT",
  "MISINFORMATION",
  "OTHER",
] as const;

export const createReportSchema = z
  .object({
    targetType: z.enum(REPORT_TARGET_TYPES, {
      errorMap: () => ({ message: "Invalid report target type." }),
    }),
    targetId: z.string().uuid("Invalid id."),
    category: z.enum(REPORT_CATEGORIES, {
      errorMap: () => ({ message: "Choose a report category." }),
    }),
    reporterName: z.string().trim().min(2, "Enter your name.").max(120),
    reporterPhone: z.string().trim().min(5, "Enter a contact phone number.").max(30),
    reporterEmail: z.string().trim().email("Enter a valid email address.").max(255),
    description: z
      .string()
      .trim()
      .min(20, "Describe the issue in at least 20 characters.")
      .max(2000),
  })
  .strict();
