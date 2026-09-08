import { z } from "zod";

export const resourceIdParamSchema = z
  .object({ resourceId: z.string().uuid("Invalid id.") })
  .strict();

export const addFavoriteSchema = z
  .object({ resourceId: z.string().uuid("Invalid id.") })
  .strict();

export const listFavoritesQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  })
  .strict();
