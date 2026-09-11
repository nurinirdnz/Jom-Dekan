import { z } from "zod";

export const postIdParamSchema = z
  .object({ postId: z.string().uuid("Invalid id.") })
  .strict();

export const commentIdParamSchema = z
  .object({ commentId: z.string().uuid("Invalid id.") })
  .strict();

export const createPostSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Title must be at least 2 characters.")
      .max(200),
    body: z.string().trim().min(1, "Body cannot be empty.").max(5000),
  })
  .strict();

export const updatePostSchema = createPostSchema;

export const createCommentSchema = z
  .object({
    body: z.string().trim().min(1, "Body cannot be empty.").max(5000),
  })
  .strict();

export const updateCommentSchema = createCommentSchema;

const voteTargetType = z.enum(["forum_post", "forum_comment"]);

export const castVoteSchema = z
  .object({
    targetType: voteTargetType,
    targetId: z.string().uuid("Invalid id."),
    value: z.union([z.literal(1), z.literal(-1)]),
  })
  .strict();

export const removeVoteSchema = z
  .object({
    targetType: voteTargetType,
    targetId: z.string().uuid("Invalid id."),
  })
  .strict();

const optionalBooleanFlag = z
  .enum(["true", "false"])
  .optional()
  .transform((v) => (v === undefined ? undefined : v === "true"));

export const listPostsQuerySchema = z
  .object({
    mine: optionalBooleanFlag,
    unanswered: optionalBooleanFlag,
    solved: optionalBooleanFlag,
    sortBy: z.enum(["newest", "oldest", "top"]).optional().default("newest"),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  })
  .strict();

export const setSolvedSchema = z.object({ solved: z.boolean() }).strict();
