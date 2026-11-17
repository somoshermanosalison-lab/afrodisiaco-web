// Empaqueta la API (backend + shared + dependencias) en un solo archivo: api/index.js.
// Vercel publica ese archivo como función en /api. Se vuelve a generar con
// `npm run build:api` (o `npm run build`) cada vez que cambie backend/ o shared/,
// y el resultado SÍ se sube a GitHub.
import { build } from 'esbuild';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

await build({
  entryPoints: [join(root, 'backend/src/vercel.ts')],
  outfile: join(root, 'api/index.js'),
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  minify: true,
  legalComments: 'none',
  // Dependencia opcional de `pg` que no se usa.
  external: ['pg-native'],
  // Algunas dependencias usan require(); en un módulo ES hay que crearlo.
  banner: { js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);" },
});
console.log('API empaquetada en api/index.js');
