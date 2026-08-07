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
