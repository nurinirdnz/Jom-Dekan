import jwt from 'jsonwebtoken';
import { env } from './env';

export interface AccessTokenPayload {
  sub: string; // user id
  role: 'USER' | 'ADMIN';
  email: string;
}

export interface RefreshTokenPayload {
  sub: string; // user id
  sid: string; // session (user_sessions.id) this refresh token belongs to
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
    algorithm: 'HS256',
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwt.accessSecret, { algorithms: ['HS256'] }) as AccessTokenPayload;
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
    algorithm: 'HS256',
  });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.jwt.refreshSecret, { algorithms: ['HS256'] }) as RefreshTokenPayload;
}
