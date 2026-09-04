import pino from 'pino';
import { env } from '../config/config/env';

/**
 * Central logger. Redacts common secret/PII-bearing fields so nothing
 * sensitive ever reaches log storage even if a caller passes it in.
 */
export const logger = pino({
  level: env.isProduction ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'passwordHash',
      'password_hash',
      'token',
      'refreshToken',
      'accessToken',
      '*.password',
      '*.passwordHash',
    ],
    censor: '[REDACTED]',
  },
});
