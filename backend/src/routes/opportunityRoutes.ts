import { Router } from "express";
import {
  getOpportunities,
  createOpportunity,
  applyToOpportunity,
} from "../controllers/opportunityController";
import { authenticate } from "../config/middleware/authMiddleware";
import { validate } from "../config/middleware/validateMiddleware";
import {
  createOpportunitySchema,
  applyOpportunitySchema,
} from "../validators/opportunityValidators";

const router = Router();

router.get("/", getOpportunities);
router.post(
  "/",
  authenticate,
  validate({ body: createOpportunitySchema }),
  createOpportunity,
);
router.post(
  "/:id/applications",
  authenticate,
  validate({ body: applyOpportunitySchema }),
  applyToOpportunity,
);

/**
 * @openapi
 * /api/v1/opportunities:
 *   get:
 *     summary: Get all active marketplace opportunities
 *     tags: [Opportunities]
 *     responses:
 *       200:
 *         description: List of active opportunities
 *   post:
 *     summary: Create a new opportunity listing
 *     tags: [Opportunities]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Opportunity created successfully
 */
router.get("/", getOpportunities);
router.post(
  "/",
  authenticate,
  validate({ body: createOpportunitySchema }),
  createOpportunity,
);
router.post(
  "/:id/applications",
  authenticate,
  validate({ body: applyOpportunitySchema }),
  applyToOpportunity,
);

export default router;
