import { Router } from "express";
import healthRoutes from "./healthRoutes";
import authRoutes from "./authRoutes";
import taxonomyRoutes from "./taxonomyRoutes";
import resourceRoutes from "./resourceRoutes";

/**
 * All product routes are mounted under /api/v1. System routes
 * (health/version) are mounted both at the root and under /api/v1 so
 * they work with common infra probes either way.
 */
const router = Router();

router.use(healthRoutes);
router.use("/auth", authRoutes);
router.use("/taxonomy", taxonomyRoutes);
router.use("/resources", resourceRoutes);

export default router;
