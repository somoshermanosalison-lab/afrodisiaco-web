import { createApp } from './app';
import { pool } from './db';
import { env } from './env';

createApp().listen(env.PORT, () => {
  console.log(`[api] http://localhost:${env.PORT}/api  (base de datos: ${pool ? 'conectada por DATABASE_URL' : 'sin configurar, catálogo por defecto'})`);
});
