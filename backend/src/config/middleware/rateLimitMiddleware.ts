import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { AppError } from '../../types/errors';
import type { Request, Response } from 'express';

function rateLimitedResponse(_req: Request, res: Response): void {
  const err = AppError.tooManyRequests();
  res.status(err.status).json({
    error: { code: err.code, message: err.message, details: [], requestId: res.req.requestId },
  });
}

/** Stricter limiter for auth-sensitive endpoints (login, register, reset). */
export const authRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.maxAuth,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitedResponse,
});

/** General-purpose, more permissive limiter for the rest of the API. */
export const defaultRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.maxAuth * 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitedResponse,
});
