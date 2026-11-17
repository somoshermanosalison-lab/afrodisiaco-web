# Afrodísiaco · Luz, Sonido y Efectos

Sitio web de Afrodísiaco, servicio de luz, sonido y efectos especiales para eventos
en Aguascalientes: bodas, XV años, afters y pool parties.

Es un sitio estático: un solo archivo `index.html` con todo el HTML, CSS y JavaScript
dentro. No necesita servidor, base de datos ni instalación de nada para funcionar.

## Cómo ver el sitio en tu computadora

Abre `index.html` con doble clic. Para verlo como lo verá la gente (con los videos
funcionando bien), levanta un servidor local:

```bash
python -m http.server 8090
# luego abre http://localhost:8090 en el navegador
```

## Estructura

| Carpeta / archivo | Qué es |
|---|---|
| `index.html` | El sitio completo |
| `img/` | Fotos optimizadas en WebP (las que se publican) |
| `video/` | Clips optimizados en MP4 (los que se publican) |
| `optimizar-fotos.py` | Convierte tus fotos originales a WebP con los recortes correctos |
| `optimizar-videos.py` | Convierte tus videos originales a MP4 web, con vista previa y miniatura |
| `fotos-originales/` | Tus fotos sin procesar (no se sube a GitHub) |
| `videos-originales/` | Tus videos sin procesar (no se sube a GitHub) |

## Cómo cambiar una foto

1. Copia la foto en la carpeta que le toca dentro de `fotos-originales/`, con el
   nombre del hueco que quieres llenar (por ejemplo `ancha/bodas.jpg`).
2. Corre `python optimizar-fotos.py`
3. Recarga la página.

El script te dice qué nombres espera si lo corres sin fotos. Dentro del archivo
puedes ajustar el encuadre de fotos puntuales con `FOCOS` (vertical) y `FOCOS_X`
(horizontal), sin tener que recortar nada a mano.

## Cómo cambiar un video

1. Copia el clip en `videos-originales/` como `video-01.mp4` … `video-04.mp4`
2. Ajusta en `optimizar-videos.py` el diccionario `RECORTES` (qué segundo empieza y
   cuánto dura) y `PORTADAS` (de qué segundo sale la miniatura).
3. Corre `python optimizar-videos.py`

Requiere [ffmpeg](https://ffmpeg.org/). En Windows: `winget install Gyan.FFmpeg`.

## Datos de contacto

El número de WhatsApp, el correo y el enlace de Google Maps están juntos al
principio del bloque `<script>` en `index.html`, en la constante `CONFIG`. Ahí se
cambian una sola vez y se actualizan en toda la página.

## Publicación

El sitio se publica en Vercel. Cada vez que se sube un cambio a la rama `main`,
Vercel lo despliega solo.

---

# Configurador 3D de eventos (`/configurador`)

Además del sitio, el repositorio incluye un configurador donde el cliente arma su
evento paso a paso (tipo de evento, invitados, espacio, nivel de producción y
extras), ve el montaje en 3D con los modelos de Afrodísiaco, recibe un precio
estimado en tiempo real y pide su cotización por formulario o WhatsApp.

El sitio de siempre (`index.html`) no cambia: el configurador vive aparte en
`/configurador` y se enlaza desde el menú y la sección de paquetes.

## Estructura

| Carpeta | Qué es |
|---|---|
| `shared/` | Catálogo, reglas de negocio, precios y validación. Lo usan frontend y backend |
| `frontend/` | La app del configurador (React + Vite + TypeScript + Tailwind + Three.js) |
| `frontend/public/models/` | Modelos 3D `.glb` exportados de Blender |
| `backend/` | API (Node + Express): catálogo, cotizaciones y contacto |
| `api/index.js` | La API empaquetada para Vercel. Se genera con `npm run build:api`; no se edita a mano |
| `database/` | Esquema de PostgreSQL |
| `scripts/assemble-site.mjs` | Junta el sitio actual y el configurador en `dist/` |

Dentro de `frontend/src`: `components/` (interfaz), `pages/` (pantallas), `store/`
(estado con Zustand), `services/` (precios, inventario, API), `three/` (escena 3D)
y `utils/`.

## Instalación y ejecución local

Necesitas [Node.js](https://nodejs.org) 22 o superior.

```bash
npm install
```

```bash
npm run dev
```

Eso levanta el configurador en http://localhost:5173/configurador/ y la API en
http://localhost:4000/api. Sin base de datos todo funciona con el catálogo
incluido; lo único que no se guarda son las cotizaciones (el cliente todavía puede
enviarlas por WhatsApp).

Revisiones antes de publicar:

```bash
npm run lint
```

```bash
npm run typecheck
```

```bash
npm test
```

```bash
npm run build
```

## Variables de entorno

Copia `backend/.env.example` como `backend/.env`. Ese archivo nunca se sube a GitHub.

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Conexión de PostgreSQL. Vacía = catálogo por defecto y sin guardar cotizaciones |
| `CORS_ORIGINS` | Sitios que pueden llamar a la API, separados por coma |
| `ADMIN_TOKEN` | Token de `/api/admin` (mínimo 24 caracteres). Vacío = admin cerrado |
| `DB_POOL_MAX` | Conexiones simultáneas a la base (5 por defecto) |
| `PORT` | Puerto local de la API (4000) |

En el frontend solo existe `VITE_API_URL` (opcional, ver `frontend/.env.example`).
Todo lo que empieza con `VITE_` es público: ahí nunca van secretos.

## Base de datos

1. Crea una base PostgreSQL (por ejemplo en Neon, Supabase o Vercel Postgres).
2. Pon su cadena de conexión en `DATABASE_URL`.
3. Crea las tablas: `psql "$DATABASE_URL" -f database/schema.sql`
4. Carga el catálogo: `npm run db:seed`

`db:seed` solo agrega lo que falta; no pisa precios ni inventario que ya hayas
cambiado. Para volver a los valores del código: `npm run db:seed -- --force`.

Las cotizaciones se guardan en la tabla `quotes` con estado `pending`,
`contacted`, `quoted`, `confirmed` o `cancelled`.

## Cómo cambiar precios, paquetes, extras e inventario

Todo está en **un solo archivo**: `shared/src/catalog.ts`.

- **Precios base y contenido de los paquetes:** `DEFAULT_PACKAGES`.
- **Extras (precio, cantidad máxima, requisitos):** `DEFAULT_ADDONS`.
- **Inventario (cuántas unidades hay de cada equipo):** `DEFAULT_EQUIPMENT`.
- **Tipos de evento, colores de luz y recargo por complejidad:** `DEFAULT_EVENT_TYPES`.
- **WhatsApp y correo:** `CONTACT`.

> ⚠ Los valores marcados como `PROVISIONAL` en ese archivo (precios de extras y
> cantidades de inventario) son cifras de arranque, no datos reales del negocio.
> Hay que revisarlos antes de publicar.

Si usas base de datos, después de editar el archivo corre `npm run db:seed -- --force`,
o edita directamente las tablas `packages`, `addons` y `equipment`.

Las reglas (a partir de cuántos invitados se recomienda cada nivel, alturas
mínimas, avisos de espacio) están en `shared/src/rules.ts`, y la fórmula del
precio en `shared/src/pricing.ts`.

## Cómo agregar o cambiar un modelo 3D

1. Exporta el modelo desde Blender como `.glb` (con +Y hacia arriba, el frente del
   equipo mirando a -Y en Blender y el origen en la base).
2. Guárdalo en `frontend/public/models/`.
3. En `shared/src/catalog.ts`, pon su ruta en el campo `model3D` del equipo
   (por ejemplo `'/models/robot.glb'`).

El equipo visible que tenga `model3D: null` se dibuja como una caja con la leyenda
"modelo 3D pendiente". Hoy todo el equipo visible tiene modelo; la pista iluminada
y las chispas de los chisperos se dibujan por código. Si un modelo falla al
cargar, se muestra esa misma caja y el configurador sigue funcionando.

Dónde se coloca cada equipo en el salón se decide en `frontend/src/three/layout.ts`.

## API

| Método y ruta | Qué hace |
|---|---|
| `GET /api/equipment` | Inventario |
| `GET /api/packages` | Paquetes |
| `GET /api/addons` | Extras activos |
| `POST /api/quotes` | Guarda una cotización (el servidor recalcula precio y equipo) |
| `POST /api/contact` | Guarda un mensaje de contacto |
| `GET /api/admin/quotes` | Lista cotizaciones |
| `PATCH /api/admin/quotes/:id/status` | Cambia el estado de una cotización |
| `GET /api/admin/catalog` | Catálogo completo, incluidos los extras inactivos |
| `PATCH /api/admin/addons/:id` | Cambia precio, cantidad máxima o activa/desactiva un extra |
| `PATCH /api/admin/equipment/:id` | Cambia las unidades disponibles de un equipo |
| `PATCH /api/admin/packages/:id` | Cambia precio base o invitados máximos de un paquete |

Todo `/api/admin` requiere el encabezado `Authorization: Bearer <ADMIN_TOKEN>`.

## Administración (`/configurador/admin`)

Pantalla para el negocio. Pide el token de administrador (el valor de `ADMIN_TOKEN`)
y lo guarda solo mientras la pestaña está abierta. Desde ahí se puede:

- Ver las cotizaciones recibidas, filtrarlas y cambiar su estado.
- Cambiar precios y cantidad máxima de los extras, y activarlos o desactivarlos.
- Cambiar el inventario disponible de cada equipo.
- Cambiar el precio base y los invitados máximos de cada paquete.

Necesita la base de datos conectada y sembrada (`npm run db:seed`). Sin ella la
pantalla solo permite consultar el catálogo. Lo que se cambia ahí tarda hasta un
minuto en verse en el configurador público.

## Publicar el configurador

`vercel.json` ya está preparado: Vercel corre `npm run build`, publica la carpeta
`dist/` (sitio actual + `/configurador`) y expone la API en `/api`.

En el proyecto de Vercel agrega las variables `DATABASE_URL`, `ADMIN_TOKEN` y
`CORS_ORIGINS` (con el dominio del sitio). Si prefieres la API en otro servicio
(Render, Railway, Fly), publica la carpeta `backend/` con `npm run start -w backend`
y pon su dirección en `VITE_API_URL`.

## Analítica

El configurador emite estos eventos a `window.dataLayer` (Google Tag Manager / GA4)
si existe: `configurator_started`, `event_type_selected`, `production_selected`,
`addon_selected`, `configuration_completed`, `quote_requested`, `whatsapp_clicked`.
Nunca incluyen nombre, teléfono, correo ni comentarios.
