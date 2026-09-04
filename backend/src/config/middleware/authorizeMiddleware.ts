import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../types/errors';

/**
 * Role-based gate. Must run after `authenticate`. Ownership checks
 * (does this user own THIS resource) are the responsibility of the
 * service layer, not this middleware — knowing an ID must never grant
 * access on its own.
 */
export function authorize(...allowedRoles: Array<'USER' | 'ADMIN'>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized());
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(AppError.forbidden());
      return;
    }
    next();
  };
}
