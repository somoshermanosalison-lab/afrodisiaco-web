import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const MIME: Record<string, string> = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

/**
 * En producción las fotos viven en /img del sitio (raíz del repositorio).
 * En desarrollo este plugin las sirve desde ahí para no duplicarlas.
 */
function serveSiteImages(): Plugin {
  const root = resolve(import.meta.dirname, '../img');
  return {
    name: 'afrodisiaco-site-images',
    configureServer(server) {
      server.middlewares.use('/img', (req, res, next) => {
        const file = normalize(join(root, decodeURIComponent((req.url ?? '').split('?')[0])));
        if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) return next();
        res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
        createReadStream(file).pipe(res);
      });
    },
  };
}

export default defineConfig({
  // El configurador se publica dentro del sitio actual, en /configurador/.
  base: '/configurador/',
  plugins: [react(), tailwindcss(), serveSiteImages()],
  resolve: { alias: { '@': resolve(import.meta.dirname, 'src') } },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:4000' },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
  },
});
