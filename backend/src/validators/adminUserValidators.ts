import { z } from "zod";

export const userIdParamSchema = z
  .object({ id: z.string().uuid("Invalid id.") })
  .strict();

export const listAdminUsersQuerySchema = z
  .object({
    search: z.string().trim().min(1).max(200).optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  })
  .strict();

export const adminUserSubListQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  })
  .strict();
