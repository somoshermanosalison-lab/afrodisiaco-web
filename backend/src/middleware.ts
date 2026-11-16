import { timingSafeEqual } from 'node:crypto';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError, z } from 'zod';
import { StorageUnavailableError } from './db';
import { env } from './env';

/** Quita caracteres de control y marcas HTML de todos los textos de un objeto. */
export function sanitizeDeep<T>(value: T): T {
  if (typeof value === 'string') {
    // eslint-disable-next-line no-control-regex
    return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/[<>]/g, '') as T;
  }
  if (Array.isArray(value)) return value.map(sanitizeDeep) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitizeDeep(v)])) as T;
  }
  return value;
}

export const requireAdmin: RequestHandler = (req, res, next) => {
  const token = env.ADMIN_TOKEN;
  const given = req.headers.authorization?.replace(/^Bearer\s+/i, '') ?? '';
  const ok =
    !!token &&
    given.length === token.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(token));
  if (!ok) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  next();
};

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'not_found' });
};

/** Respuestas de error sin detalles técnicos; el detalle queda en el log del servidor. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'validation', fields: z.flattenError(err).fieldErrors, issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) });
    return;
  }
  if (err instanceof StorageUnavailableError) {
    res.status(503).json({ error: 'storage_unavailable' });
    return;
  }
  if (err instanceof SyntaxError || (err as { type?: string }).type === 'entity.too.large') {
    res.status(400).json({ error: 'bad_request' });
    return;
  }
  console.error('[api] error no controlado:', err);
  res.status(500).json({ error: 'internal' });
};
