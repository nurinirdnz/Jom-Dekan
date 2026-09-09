import { Router } from "express";
import { forumController } from "../controllers/forumController";
import { validate } from "../config/middleware/validateMiddleware";
import { authenticate } from "../config/middleware/authMiddleware";
import {
  postIdParamSchema,
  commentIdParamSchema,
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
  updateCommentSchema,
  castVoteSchema,
  removeVoteSchema,
  listPostsQuerySchema,
} from "../validators/forumValidators";

const router = Router();

/**
 * @openapi
 * /forum/posts:
 *   get:
 *     tags: [Forum]
 *     summary: List forum posts (or your own, via ?mine=true)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of posts }
 *   post:
 *     tags: [Forum]
 *     summary: Create a forum post
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Post created }
 */
router.get(
  "/posts",
  authenticate,
  validate({ query: listPostsQuerySchema }),
  forumController.listPosts,
);
router.post(
  "/posts",
  authenticate,
  validate({ body: createPostSchema }),
  forumController.createPost,
);

/**
 * @openapi
 * /forum/posts/{postId}:
 *   get:
 *     tags: [Forum]
 *     summary: Get a forum post by id
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Post detail }
 *       404: { description: Not found or deleted }
 *   put:
 *     tags: [Forum]
 *     summary: Edit a post (owner or ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Post updated }
 *       403: { description: Not the owner }
 *   delete:
 *     tags: [Forum]
 *     summary: Soft-delete a post (owner or ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Post deleted }
 */
router.get(
  "/posts/:postId",
  authenticate,
  validate({ params: postIdParamSchema }),
  forumController.getPost,
);
router.put(
  "/posts/:postId",
  authenticate,
  validate({ params: postIdParamSchema, body: updatePostSchema }),
  forumController.updatePost,
);
router.delete(
  "/posts/:postId",
  authenticate,
  validate({ params: postIdParamSchema }),
  forumController.removePost,
);

/**
 * @openapi
 * /forum/posts/{postId}/comments:
 *   get:
 *     tags: [Forum]
 *     summary: List comments on a post
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of comments }
 *   post:
 *     tags: [Forum]
 *     summary: Add a comment to a post
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Comment added }
 *       404: { description: Post not found or deleted }
 */
router.get(
  "/posts/:postId/comments",
  authenticate,
  validate({ params: postIdParamSchema }),
  forumController.listComments,
);
router.post(
  "/posts/:postId/comments",
  authenticate,
  validate({ params: postIdParamSchema, body: createCommentSchema }),
  forumController.createComment,
);

/**
 * @openapi
 * /forum/comments/{commentId}:
 *   put:
 *     tags: [Forum]
 *     summary: Edit a comment (owner or ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Comment updated }
 *   delete:
 *     tags: [Forum]
 *     summary: Soft-delete a comment (owner or ADMIN only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Comment deleted }
 */
router.put(
  "/comments/:commentId",
  authenticate,
  validate({ params: commentIdParamSchema, body: updateCommentSchema }),
  forumController.updateComment,
);
router.delete(
  "/comments/:commentId",
  authenticate,
  validate({ params: commentIdParamSchema }),
  forumController.removeComment,
);

/**
 * @openapi
 * /forum/votes:
 *   post:
 *     tags: [Forum]
 *     summary: Cast or change a vote on a post or comment (idempotent upsert)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Vote recorded }
 *       404: { description: Target not found or deleted }
 *   delete:
 *     tags: [Forum]
 *     summary: Remove your vote on a post or comment
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Vote removed }
 */
router.post(
  "/votes",
  authenticate,
  validate({ body: castVoteSchema }),
  forumController.castVote,
);
router.delete(
  "/votes",
  authenticate,
  validate({ body: removeVoteSchema }),
  forumController.removeVote,
);

export default router;
