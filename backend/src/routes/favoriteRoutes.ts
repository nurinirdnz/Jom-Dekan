import { Router } from "express";
import { favoriteController } from "../controllers/favoriteController";
import { validate } from "../config/middleware/validateMiddleware";
import { authenticate } from "../config/middleware/authMiddleware";
import {
  addFavoriteSchema,
  resourceIdParamSchema,
  listFavoritesQuerySchema,
} from "../validators/favoriteValidators";

const router = Router();

/**
 * @openapi
 * /favorites:
 *   get:
 *     tags: [Favorites]
 *     summary: List the current user's favorited resources
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of favorited resources }
 *   post:
 *     tags: [Favorites]
 *     summary: Favorite a resource (idempotent)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Favorited }
 *       404: { description: Resource not found or not visible }
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
 * /favorites/{resourceId}:
 *   get:
 *     tags: [Favorites]
 *     summary: Check whether the current user has favorited a resource
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Favorite status }
 *   delete:
 *     tags: [Favorites]
 *     summary: Unfavorite a resource (idempotent)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Unfavorited }
 */
router.get(
  "/:resourceId",
  authenticate,
  validate({ params: resourceIdParamSchema }),
  favoriteController.checkStatus,
);
router.delete(
  "/:resourceId",
  authenticate,
  validate({ params: resourceIdParamSchema }),
  favoriteController.remove,
);

export default router;
