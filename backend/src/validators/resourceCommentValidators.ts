import { z } from "zod";

export const resourceIdParamSchema = z
  .object({ resourceId: z.string().uuid("Invalid resource id.") })
  .strict();
export const commentIdParamSchema = z
  .object({ commentId: z.string().uuid("Invalid comment id.") })
  .strict();
export const resourceCommentBodySchema = z
  .object({
    body: z.string().trim().min(1, "Comment cannot be empty.").max(2000),
  })
  .strict();
