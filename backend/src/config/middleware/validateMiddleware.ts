import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { AppError } from '../../types/errors';

interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Validates and replaces req.body/query/params with the parsed, typed
 * result of the given Zod schemas. Unknown fields are stripped by the
 * schemas themselves (use .strict() where mass-assignment risk exists).
 * Throws a single AppError with every field-level issue attached so the
 * client gets the whole picture in one round trip.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const details: Array<{ field?: string; message: string }> = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        for (const issue of result.error.issues) {
          details.push({ field: issue.path.join('.'), message: issue.message });
        }
      } else {
        req.body = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        for (const issue of result.error.issues) {
          details.push({ field: issue.path.join('.'), message: issue.message });
        }
      } else {
        req.query = result.data as typeof req.query;
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        for (const issue of result.error.issues) {
          details.push({ field: issue.path.join('.'), message: issue.message });
        }
      } else {
        req.params = result.data as typeof req.params;
      }
    }

    if (details.length > 0) {
      next(AppError.badRequest('The request contains invalid fields.', details));
      return;
    }

    next();
  };
}
