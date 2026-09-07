import { z } from "zod";

export const createOpportunitySchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters long.")
    .max(255),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters long.")
    .max(5000),
  subjectId: z.string().uuid().optional(),
  listingType: z.enum(["TUTORING", "STUDY_GROUP", "PROJECT_MENTORSHIP"]),
  mode: z.enum(["ONLINE", "PHYSICAL", "HYBRID"]),
});

export const applyOpportunitySchema = z.object({
  coverMessage: z
    .string()
    .min(10, "Cover message must be at least 10 characters long.")
    .max(2000),
});
