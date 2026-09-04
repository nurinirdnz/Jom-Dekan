import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';

/**
 * All product routes are mounted under /api/v1. System routes
 * (health/version) are mounted both at the root and under /api/v1 so
 * they work with common infra probes either way.
 */
const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);

export default router;
