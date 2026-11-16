import pg from 'pg';
import { env } from './env';

/** null cuando no hay DATABASE_URL: la API sigue sirviendo el catálogo por defecto. */
export const pool: pg.Pool | null = env.DATABASE_URL
  ? new pg.Pool({
      connectionString: env.DATABASE_URL,
      max: env.DB_POOL_MAX,
      ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    })
  : null;

pool?.on('error', (err) => console.error('[db] error de conexión inactiva:', err.message));

export class StorageUnavailableError extends Error {
  constructor() {
    super('storage_unavailable');
  }
}

export function requirePool(): pg.Pool {
  if (!pool) throw new StorageUnavailableError();
  return pool;
}
