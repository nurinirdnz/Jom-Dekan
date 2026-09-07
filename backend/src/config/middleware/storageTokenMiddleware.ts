import type { NextFunction, Request, Response } from 'express';
import { verifyStorageToken } from '../config/storage';
import { AppError } from '../../types/errors';

declare module 'express-serve-static-core' {
  interface Request {
    storageToken?: { key: string };
  }
}

/**
 * Gates the two storage routes (upload PUT, download GET) that a real
 * S3 presigned URL would also gate purely by a signed token, with no
 * bearer-token session involved. The token carries only an opaque
 * storage key and a purpose — never a fileId (the adapter doesn't know
 * about resource_files.id, only the storage key), and never anything
 * else that would need to be kept in sync with app-level state.
 *
 * A generic error message is used deliberately — never leak whether a
 * token failed because it was expired, forged, or wrong-purpose.
 */
export function verifyStorageTokenMiddleware(purpose: 'upload' | 'download') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const token = req.query.token;
    if (typeof token !== 'string' || token.length === 0) {
      next(AppError.unauthorized('Invalid or expired link.'));
      return;
    }
    try {
      req.storageToken = verifyStorageToken(token, purpose);
      next();
    } catch {
      next(AppError.unauthorized('Invalid or expired link.'));
    }
  };
}
