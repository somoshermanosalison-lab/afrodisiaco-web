import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  /** Cadena de conexión de PostgreSQL. Sin ella la API usa el catálogo por defecto. */
  DATABASE_URL: z.string().min(1).optional(),
  /** Conexiones simultáneas a la base. En funciones serverless conviene un número bajo. */
  DB_POOL_MAX: z.coerce.number().int().min(1).max(50).default(5),
  /** Orígenes permitidos por CORS, separados por coma. */
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  /** Token de los endpoints /api/admin. Sin él, esos endpoints quedan cerrados. */
  ADMIN_TOKEN: z.string().min(24).optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Variables de entorno inválidas:', z.flattenError(parsed.error).fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};
