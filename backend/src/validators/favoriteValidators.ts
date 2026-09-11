import { z } from "zod";

export const FAVORITE_TARGET_TYPES = ["resource", "forum_post", "opportunity"] as const;

const targetTypeSchema = z.enum(FAVORITE_TARGET_TYPES, {
  errorMap: () => ({ message: "Invalid target type." }),
});

export const targetParamSchema = z
  .object({
    targetType: targetTypeSchema,
    targetId: z.string().uuid("Invalid id."),
  })
  .strict();

export const addFavoriteSchema = z
  .object({
    targetType: targetTypeSchema,
    targetId: z.string().uuid("Invalid id."),
  })
  .strict();

export const listFavoritesQuerySchema = z
  .object({
    targetType: targetTypeSchema.optional().default("resource"),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  })
  .strict();
