"""
Optimiza los videos cortos de la galeria de Afrodisiaco para la web.

USO
---
    python optimizar-videos.py

Lee los originales de:   videos-originales/<nombre>.mp4
y escribe:               video/<nombre>-web.mp4    (el clip que se ve al darle play)
                         video/<nombre>-prev.mp4   (vista previa muda para el hover)
                         img/<nombre>-600.webp     (la miniatura/portada del clip)

QUE HACE
    - Recorta cada clip al pedazo que vale la pena (ver RECORTES, abajo).
    - Reescala para que el lado largo no pase de 1280 px.
    - Comprime en H.264 + AAC, el formato que reproducen todos los navegadores,
      con un tope de bitrate para que ningun clip se dispare de peso.
    - Quita el grano de las tomas nocturnas (se ve mejor y pesa menos).
    - Deja el indice al principio del archivo (faststart) para que empiece
      a reproducirse sin esperar a que baje completo.
    - Saca una vista previa de 5 segundos, chica y sin audio, que es la que
      corre en bucle cuando alguien pasa el cursor por la galeria.
    - Saca una miniatura cuadrada del propio video para el hueco de la galeria.

REQUISITO
    ffmpeg instalado y accesible desde la terminal.
    En Windows:  winget install Gyan.FFmpeg     (luego cierra y abre la terminal)

NOMBRES ESPERADOS (el nombre decide en que hueco de la galeria cae el clip)
    videos-originales/video-01.mp4   Galeria - video 01
    videos-originales/video-02.mp4   Galeria - video 02
    videos-originales/video-03.mp4   Galeria - video 03
    videos-originales/video-04.mp4   Galeria - video 04
"""

import json
import shutil
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
ORIGINALES = RAIZ / "videos-originales"
SALIDA_VIDEO = RAIZ / "video"
SALIDA_IMG = RAIZ / "img"

LIMITE_SEGUNDOS = 12   # duracion de los clips publicados
LADO_LARGO = 1920      # resolucion maxima del lado mayor (los originales son 1080p)
CRF = 24               # 20-26: mas alto = archivo mas chico y menos nitido
TECHO_KBPS = 4500      # tope de bitrate; evita que un clip se dispare de peso
MINIATURA = 600        # lado de la miniatura cuadrada, en pixeles
PREVIA_SEGUNDOS = 5    # duracion de la vista previa muda que corre al pasar el cursor
PREVIA_ANCHO = 480     # ancho de esa vista previa
EXTENSIONES = {".mp4", ".mov", ".m4v", ".avi", ".mkv", ".webm", ".3gp"}

# Que pedazo de cada clip se publica:  nombre -> (segundo en que empieza, cuantos segundos dura)
# Si un nombre no esta aqui, se usan los primeros LIMITE_SEGUNDOS segundos.
# Cambia estos numeros si quieres mover el recorte y vuelve a correr el script.
RECORTES = {
    "video-01": (66, 12),   # la pista llena de la boda, bajo el drapeado
    "video-02": (38, 12),   # llega al primer plano del cabezon con los novios
    "video-03": (1, 12),    # la pista llena, antes de que la camara acabe en la cabina
    "video-04": (21, 12),   # aqui la camara ya se despego del invitado: pista completa
}

# De que segundo del ORIGINAL se saca la miniatura de cada clip.
# Si un nombre no esta aqui, se toma un cuadro de en medio del recorte.
PORTADAS = {
    "video-01": 72.0,   # la quinceanera de frente, con corona, bailando en circulo
    "video-02": 45.0,   # el cabezon con los novios, de frente y sonriendo
    "video-03": 8.0,    # el cabezon de Homero grande, con el muro de flores detras
    "video-04": 32.0,   # parejas bailando por toda la pista, sin nadie tapando
}

HUECOS = [
    ("video-01", "Galeria - video 01  (arranque de pista)"),
    ("video-02", "Galeria - video 02  (pirotecnia y CO2)"),
    ("video-03", "Galeria - video 03  (primer baile, humo bajo)"),
    ("video-04", "Galeria - video 04  (cabezones y robot LED)"),
]


def correr(cmd):
    """Ejecuta ffmpeg/ffprobe y devuelve su salida; lanza error si falla."""
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip().splitlines()[-1] if r.stderr.strip() else "ffmpeg fallo")
    return r.stdout


def datos(origen):
    """Devuelve (ancho, alto, duracion_en_segundos) del video original."""
    salida = correr([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height:format=duration",
        "-of", "json", str(origen),
    ])
    info = json.loads(salida)
    flujo = info["streams"][0]
    duracion = float(info.get("format", {}).get("duration", 0) or 0)
    return int(flujo["width"]), int(flujo["height"]), duracion


def medidas(ancho, alto):
    """Reescala para que el lado largo no pase de LADO_LARGO, en numeros pares."""
    mayor = max(ancho, alto)
    factor = min(1.0, LADO_LARGO / mayor)
    par = lambda n: max(2, int(round(n * factor)) // 2 * 2)
    return par(ancho), par(alto)


def comprimir(origen, destino, ancho, alto, inicio, dura):
    """El clip que se ve al darle play: con sonido y a buena resolucion."""
    correr([
        "ffmpeg", "-y", "-ss", f"{inicio:.2f}", "-i", str(origen),
        "-t", f"{dura:.2f}",
        # hqdn3d suave: quita algo del grano nocturno sin emborronar las caras
        "-vf", f"hqdn3d=1.5:1:3:3,scale={ancho}:{alto},fps=30",
        "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
        "-crf", str(CRF), "-preset", "slow",
        "-maxrate", f"{TECHO_KBPS}k", "-bufsize", f"{TECHO_KBPS * 2}k",
        "-c:a", "aac", "-b:a", "128k", "-ac", "2",
        "-movflags", "+faststart",
        str(destino),
    ])


def vista_previa(origen, destino, ancho, alto, inicio, dura):
    """Version corta, chica y sin audio: la que corre en bucle al pasar el cursor."""
    prev_ancho = min(PREVIA_ANCHO, ancho)
    prev_alto = max(2, int(round(alto * prev_ancho / ancho)) // 2 * 2)
    correr([
        "ffmpeg", "-y", "-ss", f"{inicio:.2f}", "-i", str(origen),
        "-t", f"{min(PREVIA_SEGUNDOS, dura):.2f}", "-an",
        "-vf", f"hqdn3d=4:3:6:6,scale={prev_ancho}:{prev_alto},fps=24",
        "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p",
        "-crf", "33", "-preset", "slow",
        "-maxrate", "700k", "-bufsize", "1400k",
        "-movflags", "+faststart",
        str(destino),
    ])


def miniatura(origen, destino, ancho, alto, momento):
    """Saca un cuadro del video, lo recorta cuadrado y lo guarda en WebP."""
    lado = min(ancho, alto)
    x, y = (ancho - lado) // 2, (alto - lado) // 2
    correr([
        "ffmpeg", "-y", "-ss", f"{momento:.2f}", "-i", str(origen),
        "-frames:v", "1",
        "-vf", f"crop={lado}:{lado}:{x}:{y},scale={MINIATURA}:{MINIATURA}",
        "-c:v", "libwebp", "-quality", "82",
        str(destino),
    ])


def recorte(nombre, duracion):
    """Devuelve (inicio, duracion) del pedazo que se publica."""
    inicio, dura = RECORTES.get(nombre, (0, LIMITE_SEGUNDOS))
    if duracion:
        inicio = min(inicio, max(0, duracion - 1))
        dura = min(dura, duracion - inicio)
    return inicio, dura


def procesar(origen):
    # nombre sin extension, aunque Windows la haya duplicado (video-01.mp4.mp4)
    nombre = origen.name.split(".")[0]
    ancho, alto, duracion = datos(origen)
    inicio, dura = recorte(nombre, duracion)
    if duracion > dura:
        print(f"    dura {duracion:.0f}s, publico del segundo {inicio:.0f} al {inicio + dura:.0f}")

    nuevo_ancho, nuevo_alto = medidas(ancho, alto)
    clip = SALIDA_VIDEO / f"{nombre}-web.mp4"
    comprimir(origen, clip, nuevo_ancho, nuevo_alto, inicio, dura)
    mb = clip.stat().st_size / (1024 * 1024)
    print(f"    -> video/{clip.name}  ({nuevo_ancho}x{nuevo_alto}, {mb:.1f} MB)")
    if mb > 5:
        print(f"       pesa bastante: baja TECHO_KBPS (ahora {TECHO_KBPS}) o acorta el recorte")

    previa = SALIDA_VIDEO / f"{nombre}-prev.mp4"
    vista_previa(origen, previa, nuevo_ancho, nuevo_alto, inicio, dura)
    kb = previa.stat().st_size / 1024
    print(f"    -> video/{previa.name}  (vista previa muda, {kb:.0f} KB)")

    portada = SALIDA_IMG / f"{nombre}-{MINIATURA}.webp"
    try:
        miniatura(origen, portada, ancho, alto, PORTADAS.get(nombre, inicio + dura * 0.35))
        kb = portada.stat().st_size / 1024
        print(f"    -> img/{portada.name}  ({kb:.0f} KB)")
    except Exception as e:
        print(f"    aviso: no pude generar la miniatura ({e}). El clip igual funciona.")


def main():
    for programa in ("ffmpeg", "ffprobe"):
        if not shutil.which(programa):
            sys.exit(
                f"Falta {programa}. Instalalo con:  winget install Gyan.FFmpeg\n"
                "Despues cierra y vuelve a abrir la terminal."
            )

    ORIGINALES.mkdir(exist_ok=True)
    SALIDA_VIDEO.mkdir(exist_ok=True)
    SALIDA_IMG.mkdir(exist_ok=True)

    archivos = sorted(
        f for f in ORIGINALES.iterdir()
        if f.is_file() and f.suffix.lower() in EXTENSIONES
    )

    procesados = 0
    for archivo in archivos:
        print(f"\n  {archivo.name}")
        try:
            procesar(archivo)
            procesados += 1
        except Exception as e:
            print(f"    ERROR: {e}")

    if procesados == 0:
        print("No encontre videos que procesar.\n")
        print("Copia tus clips en videos-originales/ (ya cree la carpeta).")
        print("El NOMBRE del archivo decide donde aparece el clip:\n")
        for nombre, donde in HUECOS:
            print(f"      {nombre}.mp4".ljust(24) + donde)
        print("\nClips de 8 a 15 segundos, grabados horizontales si se puede.")
    else:
        print(f"\nListo: {procesados} video(s) optimizado(s) en video/")
        print("Recarga la pagina para verlos en la galeria.")


if __name__ == "__main__":
    main()
