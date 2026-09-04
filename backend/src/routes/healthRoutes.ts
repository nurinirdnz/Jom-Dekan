import { Router } from 'express';
import { checkDatabaseConnection } from '../config/config/db';

const router = Router();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json') as { version: string };

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Basic liveness/health summary
 *     responses:
 *       200: { description: OK }
 */
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

/**
 * @openapi
 * /health/live:
 *   get:
 *     tags: [System]
 *     summary: Liveness probe — process is up
 *     responses:
 *       200: { description: OK }
 */
router.get('/health/live', (_req, res) => {
  res.json({ status: 'live' });
});

/**
 * @openapi
 * /health/ready:
 *   get:
 *     tags: [System]
 *     summary: Readiness probe — dependencies (database) are reachable
 *     responses:
 *       200: { description: Ready }
 *       503: { description: Not ready }
 */
router.get('/health/ready', async (_req, res) => {
  const dbOk = await checkDatabaseConnection();
  if (!dbOk) {
    res.status(503).json({ status: 'not-ready', database: 'unreachable' });
    return;
  }
  res.json({ status: 'ready', database: 'ok' });
});

/**
 * @openapi
 * /version:
 *   get:
 *     tags: [System]
 *     summary: API version
 *     responses:
 *       200: { description: OK }
 */
router.get('/version', (_req, res) => {
  res.json({ version: pkg.version, name: 'jomdekan-backend' });
});

export default router;
