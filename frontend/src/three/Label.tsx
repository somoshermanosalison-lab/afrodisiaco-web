import { memo, useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';

interface Props {
  text: string;
  position: [number, number, number];
  /** Alto del rótulo en metros. */
  height?: number;
  color?: string;
}

/** Rótulo de texto que siempre mira a la cámara, dibujado dentro de la escena. */
export const Label = memo(function Label({ text, position, height = 0.28, color = '#c6a15b' }: Props) {
  const { texture, aspect } = useMemo(() => {
    const font = '500 44px Inter, Arial, sans-serif';
    const canvas = document.createElement('canvas');
    const measure = canvas.getContext('2d');
    if (measure) measure.font = font;
    const width = Math.ceil((measure?.measureText(text).width ?? 300) + 48);
    canvas.width = width;
    canvas.height = 76;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(12,10,13,0.88)';
      ctx.fillRect(0, 0, width, 76);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(1.5, 1.5, width - 3, 73);
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, width / 2, 40);
    }
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    return { texture: t, aspect: width / 76 };
  }, [text, color]);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <sprite position={position} scale={[height * aspect, height, 1]}>
      <spriteMaterial map={texture} depthTest={false} transparent toneMapped={false} />
    </sprite>
  );
});
