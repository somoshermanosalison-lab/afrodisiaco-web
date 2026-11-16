import cors from 'cors';
import express, { type Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './env';
import { errorHandler, notFound } from './middleware';
import { adminRouter, publicRouter } from './routes';

export function createApp(): Express {
  const app = express();
  app.disable('x-powered-by');
  // Detrás del proxy de Vercel: necesario para que el rate limit vea la IP real.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || env.corsOrigins.includes(origin)),
      methods: ['GET', 'POST', 'PATCH'],
    }),
  );
  app.use(express.json({ limit: '20kb' }));
  app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }));

  app.use('/api/admin', adminRouter);
  app.use('/api', publicRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
