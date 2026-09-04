import { env } from './env';

/**
 * Redis / BullMQ is introduced starting at Milestone 3 (file scanning
 * jobs) and used more heavily from Milestone 6 (notification queue).
 * This module is a placeholder so config wiring exists in one place;
 * it intentionally does not open a connection during Milestone 0/1.
 */
export function isRedisConfigured(): boolean {
  return Boolean(env.redisUrl);
}
