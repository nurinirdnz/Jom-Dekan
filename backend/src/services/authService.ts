import bcrypt from 'bcryptjs';
import { createHash, randomUUID } from 'crypto';
import { userModel, toSafeUser, type UserRow } from '../models/userModel';
import { sessionModel } from '../models/sessionModel';
import { auditLogModel } from '../models/auditLogModel';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../config/config/auth';
import { env } from '../config/config/env';
import { AppError } from '../types/errors';
import { logger } from '../utils/logger';
import { parseDurationMs } from '../utils/duration';

const BCRYPT_COST = 12;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function refreshExpiryDate(): Date {
  // JWT_REFRESH_EXPIRES_IN is a jsonwebtoken duration string (e.g. "30d").
  // We independently compute the DB expiry so revocation doesn't depend
  // on trusting the token's own exp claim.
  return new Date(Date.now() + parseDurationMs(env.jwt.refreshExpiresIn));
}

interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
}

async function issueTokenPair(user: UserRow, ctx: { userAgent?: string; ipAddress?: string }): Promise<IssuedTokens> {
  const sessionId = randomUUID();
  const refreshToken = signRefreshToken({ sub: user.id, sid: sessionId });

  await sessionModel.create({
    userId: user.id,
    refreshTokenHash: hashToken(refreshToken),
    userAgent: ctx.userAgent,
    ipAddress: ctx.ipAddress,
    expiresAt: refreshExpiryDate(),
  });

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  return { accessToken, refreshToken };
}

export const authService = {
  async register(params: {
    email: string;
    password: string;
    displayName: string;
    requestId?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const existing = await userModel.findByEmail(params.email);
    if (existing) {
      // Do not reveal whether the specific account exists beyond this
      // point in flows where that matters (password reset); for
      // registration itself, a 409 is standard and acceptable.
      throw AppError.conflict('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(params.password, BCRYPT_COST);
    const user = await userModel.create({
      email: params.email,
      passwordHash,
      displayName: params.displayName,
    });

    const tokens = await issueTokenPair(user, { userAgent: params.userAgent, ipAddress: params.ipAddress });

    await auditLogModel.record({
      actorUserId: user.id,
      action: 'USER_REGISTERED',
      targetType: 'user',
      targetId: user.id,
      requestId: params.requestId,
      ipAddress: params.ipAddress,
    });

    logger.info({ userId: user.id }, 'User registered');

    return { user: toSafeUser(user), ...tokens };
  },

  async login(params: { email: string; password: string; requestId?: string; ipAddress?: string; userAgent?: string }) {
    const user = await userModel.findByEmail(params.email);
    // Constant-shape response whether the email exists or the password
    // is wrong — never let a caller distinguish "no such account" from
    // "wrong password".
    const passwordMatches = user ? await bcrypt.compare(params.password, user.password_hash) : await bcrypt.compare(params.password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidin');

    if (!user || !passwordMatches) {
      throw AppError.unauthorized('Invalid email or password.');
    }

    if (user.status !== 'ACTIVE') {
      throw AppError.forbidden('This account is not active. Contact support if you believe this is an error.');
    }

    const tokens = await issueTokenPair(user, { userAgent: params.userAgent, ipAddress: params.ipAddress });

    await auditLogModel.record({
      actorUserId: user.id,
      action: 'USER_LOGIN',
      targetType: 'user',
      targetId: user.id,
      requestId: params.requestId,
      ipAddress: params.ipAddress,
    });

    return { user: toSafeUser(user), ...tokens };
  },

  async refresh(params: { refreshToken: string; ipAddress?: string; userAgent?: string }) {
    let payload;
    try {
      payload = verifyRefreshToken(params.refreshToken);
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token.');
    }

    const tokenHash = hashToken(params.refreshToken);
    const session = await sessionModel.findByTokenHash(tokenHash);

    if (!session || session.id !== payload.sid) {
      throw AppError.unauthorized('Refresh token is not recognized.');
    }

    if (session.revoked_at) {
      // Reuse of a revoked/rotated token is a strong signal of theft:
      // revoke the whole session family for this user defensively.
      await sessionModel.revokeAllForUser(session.user_id);
      logger.warn({ userId: session.user_id, sessionId: session.id }, 'Refresh token reuse detected — revoking all sessions');
      throw AppError.unauthorized('This session has been revoked. Please log in again.');
    }

    if (session.expires_at.getTime() < Date.now()) {
      throw AppError.unauthorized('Refresh token has expired. Please log in again.');
    }

    const user = await userModel.findById(session.user_id);
    if (!user || user.status !== 'ACTIVE') {
      throw AppError.unauthorized('Account is not active.');
    }

    // Rotate: issue a brand-new refresh token and mark the old one used.
    const newSessionId = randomUUID();
    const newRefreshToken = signRefreshToken({ sub: user.id, sid: newSessionId });
    const newSession = await sessionModel.create({
      userId: user.id,
      refreshTokenHash: hashToken(newRefreshToken),
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
      expiresAt: refreshExpiryDate(),
    });
    await sessionModel.revokeAndReplace(session.id, newSession.id);

    const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });

    return { user: toSafeUser(user), accessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = verifyRefreshToken(refreshToken);
      await sessionModel.revoke(payload.sid);
    } catch {
      // Already invalid/expired — logout is idempotent either way.
    }
  },

  async getCurrentUser(userId: string) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found.');
    }
    return toSafeUser(user);
  },
};
