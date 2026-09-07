import { z } from "zod";

export const moderationActionSchema = z.object({
  action: z.enum(["approve", "reject", "quarantine"]),
  reason: z
    .string()
    .min(5, "A mandatory audit reason of at least 5 characters is required."),
});
