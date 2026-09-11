import { Router } from "express";
import { reportController } from "../controllers/reportController";
import { validate } from "../config/middleware/validateMiddleware";
import { authenticate } from "../config/middleware/authMiddleware";
import { createReportSchema } from "../validators/reportValidators";

const router = Router();

/**
 * @openapi
 * /reports:
 *   post:
 *     tags: [Reports]
 *     summary: File a report against a resource, forum post, or opportunity
 *     description: >
 *       Writes into the same `reports` table the admin moderation queue
 *       reads from. Notifies every admin (in-app notification + email).
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Report submitted }
 *       404: { description: Target not found or not visible }
 */
router.post(
  "/",
  authenticate,
  validate({ body: createReportSchema }),
  reportController.create,
);

export default router;
