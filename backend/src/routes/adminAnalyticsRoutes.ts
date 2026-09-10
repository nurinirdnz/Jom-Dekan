import { Router } from "express";
import { adminAnalyticsController } from "../controllers/adminAnalyticsController";
import { authenticate } from "../config/middleware/authMiddleware";
import { authorize } from "../config/middleware/authorizeMiddleware";

const router = Router();

router.get(
  "/analytics/overview",
  authenticate,
  authorize("ADMIN"),
  adminAnalyticsController.overview,
);

export default router;