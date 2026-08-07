"""
Optimiza las fotos de Afrodisiaco para la web.

USO
---
    python optimizar-fotos.py

Lee los originales de:   fotos-originales/<perfil>/<nombre>.jpg
y escribe las versiones: img/<nombre>-<ancho>.webp

PERFILES (recorte centrado + reescalado + WebP)
    portada    16:9   ->  2400x1350, 1600x900 y 800x450   (solo el hero)
    ancha      16:9   ->  1600x900   y  800x450
    vertical    4:5   ->  1000x1250  y  500x625
    cuadrada    1:1   ->  1200x1200  y  600x600

El nombre del archivo define en que hueco de la pagina aparece la foto.
La lista completa de nombres esperados esta al final de este archivo
(se imprime tambien al ejecutar el script).
"""

import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Falta Pillow. Instalalo con:  python -m pip install Pillow")

RAIZ = Path(__file__).resolve().parent
ORIGINALES = RAIZ / "fotos-originales"
SALIDA = RAIZ / "img"

CALIDAD = 82  # 80-85 es el punto dulce en WebP: se ve identico y pesa ~4x menos
CALIDAD_COMPLETA = 88  # la que se abre en grande va un poco mejor: se ve de cerca
EXTENSIONES = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"}

# perfil -> (proporcion ancho/alto, [(ancho, alto), ...], foco vertical del recorte)
# El foco vertical decide que parte se conserva al recortar: 0.5 = centro,
# valores menores conservan la parte de arriba (util para caras).
PERFILES = {
    "portada":  (16 / 9, [(2400, 1350), (1600, 900), (800, 450)], 0.50),
    "ancha":    (16 / 9, [(1600, 900), (800, 450)],   0.50),
    "vertical": (4 / 5,  [(1000, 1250), (500, 625)],  0.35),
    "cuadrada": (1 / 1,  [(1200, 1200), (600, 600)],  0.45),
}

# Foco vertical distinto para fotos puntuales, cuando el centro no es lo que
# hay que conservar.  0 = pega el recorte arriba, 1 = lo pega abajo.
FOCOS = {
    "confetti":       0.85,  # la pareja esta abajo; centrado le cortaba los pies
    "lanzallamas":    0.35,  # lo que importa son las llamaradas de arriba
    "detalle-cabina": 0.85,  # foto vertical: la consola y la pista LED estan abajo
}

# Foco horizontal, para las fotos cuyo montaje no esta en el centro del cuadro.
# Importa sobre todo al pasar de 16:9 a cuadrado, donde se va casi la mitad
# del ancho.  0 = pega el recorte a la izquierda, 1 = a la derecha.
FOCOS_X = {
    "galeria-03": 0.62,  # centrado entraba media cortina vacia por la izquierda
    "galeria-08": 0.42,  # centrado dejaba demasiada pared libre a la derecha
}

# Perfiles que ademas guardan la foto COMPLETA, sin recortar, como
# <nombre>-full.webp.  En la galeria el hueco es cuadrado, pero al tocar la
# foto se abre esta version entera para que se vea todo el montaje.
PERFILES_COMPLETOS = {"cuadrada"}
COMPLETA_ANCHO = 1920  # ancho maximo de esa version; si el original es menor, no se estira

# Nombre de archivo esperado -> hueco de la pagina
HUECOS = {
    "portada": [
        ("portada", "Hero · panoramica del salon con la pista llena"),
    ],
    "ancha": [
        ("bodas",              "Servicios · Bodas"),
        ("xv",                 "Servicios · XV Años"),
        ("afters",             "Servicios · Afters & Pool Party"),
        ("pirotecnia",         "Efectos · Pirotecnia"),
        ("confetti",           "Efectos · Confetti en CO2"),
        ("lanzallamas",        "Efectos · Lanzallamas"),
        ("humo-bajo",          "Efectos · Humo bajo"),
        ("paquete-esencial",   "Paquete 01 · Esencial Party"),
        ("paquete-premium",    "Paquete 02 · Premium Vibes"),
        ("paquete-ultimate",   "Paquete 03 · Ultimate Experience"),
        ("detalle-cabina",     "Paquetes · detalle consola/cabina"),
        ("detalle-humo",       "Paquetes · detalle humo y haz de luz"),
        ("detalle-montaje",    "Paquetes · detalle montaje"),
    ],
    "vertical": [
        ("robot-led",           "Robot LED  (el robot es alto: va vertical)"),
        ("cabezon-mascara",     "Cabezones · La Mascara"),
        ("cabezon-beetlejuice", "Cabezones · Beetlejuice"),
        ("cabezon-babo",        "Cabezones · Babo"),
        ("cabezon-peso-pluma",  "Cabezones · Peso Pluma"),
        ("cabezon-homero",      "Cabezones · Homero Simpson"),
        ("cabezon-luis-miguel", "Cabezones · Luis Miguel"),
        ("cabezon-homero-duff", "Cabezones · Homero Duff"),
    ],
    "cuadrada": [
        (f"galeria-{i:02d}", f"Galeria · foto {i:02d}") for i in range(1, 9)
    ],
}


def recorte(im, proporcion, foco_y, foco_x=0.5):
    """Recorta la imagen a la proporcion pedida conservando el centro de interes."""
    ancho, alto = im.size
    if ancho / alto > proporcion:
        nuevo_ancho, nuevo_alto = round(alto * proporcion), alto
    else:
        nuevo_ancho, nuevo_alto = ancho, round(ancho / proporcion)
    x = round((ancho - nuevo_ancho) * foco_x)
    y = round((alto - nuevo_alto) * foco_y)
    return im.crop((x, y, x + nuevo_ancho, y + nuevo_alto))


def procesar(origen, perfil):
    proporcion, medidas, foco_perfil = PERFILES[perfil]
    foco_y = FOCOS.get(origen.stem, foco_perfil)
    foco_x = FOCOS_X.get(origen.stem, 0.5)
    with Image.open(origen) as im:
        im = ImageOps.exif_transpose(im)  # respeta la rotacion de la camara
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGB")

        mayor_ancho, mayor_alto = medidas[0]
        if im.width < mayor_ancho or im.height < mayor_alto:
            print(f"    aviso: el original es de {im.width}x{im.height}, "
                  f"menor que {mayor_ancho}x{mayor_alto}. Se vera algo suave.")

        base = recorte(im, proporcion, foco_y, foco_x)
        for ancho, alto in medidas:
            destino = SALIDA / f"{origen.stem}-{ancho}.webp"
            base.resize((ancho, alto), Image.LANCZOS).save(
                destino, "WEBP", quality=CALIDAD, method=6
            )
            kb = destino.stat().st_size / 1024
            print(f"    -> img/{destino.name}  ({kb:.0f} KB)")

        if perfil in PERFILES_COMPLETOS:
            destino = SALIDA / f"{origen.stem}-full.webp"
            entera = im
            if entera.width > COMPLETA_ANCHO:
                nuevo_alto = round(entera.height * COMPLETA_ANCHO / entera.width)
                entera = entera.resize((COMPLETA_ANCHO, nuevo_alto), Image.LANCZOS)
            entera.save(destino, "WEBP", quality=CALIDAD_COMPLETA, method=6)
            kb = destino.stat().st_size / 1024
            print(f"    -> img/{destino.name}  ({entera.width}x{entera.height}, "
                  f"{kb:.0f} KB)  foto completa, sin recortar")


def main():
    SALIDA.mkdir(exist_ok=True)
    for perfil in PERFILES:
        (ORIGINALES / perfil).mkdir(parents=True, exist_ok=True)

    procesadas = 0
    for perfil in PERFILES:
        carpeta = ORIGINALES / perfil
        archivos = sorted(
            f for f in carpeta.iterdir()
            if f.is_file() and f.suffix.lower() in EXTENSIONES
        )
        if not archivos:
            continue
        print(f"\n[{perfil}]")
        for archivo in archivos:
            print(f"  {archivo.name}")
            try:
                procesar(archivo, perfil)
                procesadas += 1
            except Exception as e:
                print(f"    ERROR: {e}")

    if procesadas == 0:
        print("No encontre fotos que procesar.\n")
        print("Copia tus fotos en estas carpetas (ya las cree) y vuelve a correr el script.")
        print("El NOMBRE del archivo decide donde aparece la foto:\n")
        for perfil, huecos in HUECOS.items():
            print(f"  fotos-originales/{perfil}/")
            for nombre, donde in huecos:
                print(f"      {nombre}.jpg".ljust(34) + f"{donde}")
            print()
    else:
        print(f"\nListo: {procesadas} foto(s) optimizada(s) en img/")
        print("Recarga la pagina para verlas.")


if __name__ == "__main__":
    main()
