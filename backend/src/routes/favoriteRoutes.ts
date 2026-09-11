import { Router } from "express";
import { favoriteController } from "../controllers/favoriteController";
import { validate } from "../config/middleware/validateMiddleware";
import { authenticate } from "../config/middleware/authMiddleware";
import {
  addFavoriteSchema,
  targetParamSchema,
  listFavoritesQuerySchema,
} from "../validators/favoriteValidators";

const router = Router();

/**
 * @openapi
 * /favorites:
 *   get:
 *     tags: [Favorites]
 *     summary: List the current user's favorites for one target type (resource, forum_post, or opportunity)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of favorites }
 *   post:
 *     tags: [Favorites]
 *     summary: Favorite a resource, forum post, or opportunity (idempotent)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Favorited }
 *       404: { description: Target not found or not visible }
 */
router.get(
  "/",
  authenticate,
  validate({ query: listFavoritesQuerySchema }),
  favoriteController.list,
);
router.post(
  "/",
  authenticate,
  validate({ body: addFavoriteSchema }),
  favoriteController.add,
);

/**
 * @openapi
 * /favorites/{targetType}/{targetId}:
 *   get:
 *     tags: [Favorites]
 *     summary: Check whether the current user has favorited this target
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Favorite status }
 *   delete:
 *     tags: [Favorites]
 *     summary: Unfavorite this target (idempotent)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Unfavorited }
 */
router.get(
  "/:targetType/:targetId",
  authenticate,
  validate({ params: targetParamSchema }),
  favoriteController.checkStatus,
);
router.delete(
  "/:targetType/:targetId",
  authenticate,
  validate({ params: targetParamSchema }),
  favoriteController.remove,
);

export default router;
