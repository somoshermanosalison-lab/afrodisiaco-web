// Arma la carpeta que se publica: el sitio actual tal cual + el configurador en /configurador.
//   dist/index.html, dist/img, dist/video   <- sitio de siempre (sin cambios)
//   dist/configurador/                      <- app del configurador (frontend/dist)
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');
const app = join(root, 'frontend', 'dist');

if (!existsSync(join(app, 'index.html'))) {
  console.error('Falta frontend/dist. Corre primero: npm run build -w frontend');
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(root, 'index.html'), join(out, 'index.html'));
for (const dir of ['img', 'video']) cpSync(join(root, dir), join(out, dir), { recursive: true });
cpSync(app, join(out, 'configurador'), { recursive: true });
console.log('Sitio armado en dist/ (sitio actual + /configurador)');
