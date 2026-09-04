import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import pinoHttp from 'pino-http';
import { env } from './config/config/env';
import { logger } from './utils/logger';
import { requestIdMiddleware } from './config/middleware/requestIdMiddleware';
import { notFoundMiddleware, errorMiddleware } from './config/middleware/errorMiddleware';
import { defaultRateLimiter } from './config/middleware/rateLimitMiddleware';
import { swaggerSpec } from './config/swagger';
import apiRoutes from './routes';
import healthRoutes from './routes/healthRoutes';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(requestIdMiddleware);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req as express.Request).requestId,
      autoLogging: { ignore: (req) => req.url?.startsWith('/api/v1/health') ?? false },
    }),
  );

  // Exact, explicit CORS origins only — never a wildcard with credentials.
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    }),
  );

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
        },
      },
    }),
  );

  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser(env.cookieSecret));

  app.use('/api/v1', defaultRateLimiter);

  // Swagger only in non-production, or behind auth in production — kept
  // simple here (dev/test only) per the foundation milestone's scope.
  if (!env.isProduction) {
    app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  app.use('/api/v1', apiRoutes);
  // Also expose /health and /version unversioned for simple infra probes.
  app.use(healthRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
