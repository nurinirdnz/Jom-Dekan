import type { Response } from 'express';
import { env } from '../config/config/env';

/**
 * The refresh token is the only auth token ever placed in a cookie, and
 * it is HTTP-only + Secure + SameSite=strict so client-side JS (and
 * therefore XSS) cannot read it. The access token is returned in the
 * JSON body only and is expected to live in frontend memory.
 */
export function setRefreshCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(env.jwt.refreshCookieName, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'strict',
    expires: expiresAt,
    path: '/api/v1/auth',
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(env.jwt.refreshCookieName, { path: '/api/v1/auth' });
}
