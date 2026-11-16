import { useFrame } from '@react-three/fiber';
import { memo, useEffect, useMemo, useRef } from 'react';
import { AdditiveBlending, CanvasTexture, Color, DoubleSide, type Mesh, type MeshStandardMaterial, SRGBColorSpace } from 'three';
import type { SceneItem } from './layout';

/** Piezas que se generan por código: no necesitan archivo de modelo. */

export const Pole = memo(function Pole({ item }: { item: SceneItem }) {
  const [r, h] = item.size;
  return (
    <mesh position={[item.position[0], item.position[1] + h / 2, item.position[2]]}>
      <cylinderGeometry args={[r / 2, r / 2, h, 10]} />
      <meshStandardMaterial color="#0a0a0a" metalness={0.8} roughness={0.35} />
    </mesh>
  );
});

export const Post = memo(function Post({ item }: { item: SceneItem }) {
  const [r, h] = item.size;
  return (
    <group position={item.position}>
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[0.6, 0.03, 0.45]} />
        <meshStandardMaterial color="#111" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[r / 2, r / 2, h, 12]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.8} roughness={0.35} />
      </mesh>
    </group>
  );
});

/** Imagen de marca sobre cada pantalla. */
export const ScreenContent = memo(function ScreenContent({ item, color }: { item: SceneItem; color: string }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 288;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const g = ctx.createLinearGradient(0, 0, 512, 288);
      g.addColorStop(0, '#0c0a0d');
      g.addColorStop(1, color);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 288);
      ctx.fillStyle = '#ede6dd';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 62px "Playfair Display", Georgia, serif';
      ctx.fillText('Afrodísiaco', 256, 130);
      ctx.font = '600 20px Inter, Arial, sans-serif';
      ctx.fillStyle = '#c6a15b';
      ctx.fillText('LUZ · SONIDO · EFECTOS', 256, 190);
    }
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, [color]);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={item.position}>
      <planeGeometry args={[item.size[0], item.size[1]]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
});

/** Pista iluminada: cuadrícula de módulos de 1 m que cambian de color. */
export const LedFloor = memo(function LedFloor({ item, colors, animate }: { item: SceneItem; colors: [string, string]; animate: boolean }) {
  const size = item.size[0];
  const cells = Math.max(2, Math.round(size));
  const cell = size / cells;
  const refs = useRef<(Mesh | null)[]>([]);
  const palette = useMemo(() => [new Color(colors[0]), new Color(colors[1])], [colors]);

  useFrame(({ clock }) => {
    if (!animate) return;
    const t = clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const mat = m.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.55 + 0.45 * Math.sin(t * 2 + i * 1.7);
    });
  });

  return (
    <group position={item.position}>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[size + 0.08, 0.04, size + 0.08]} />
        <meshStandardMaterial color="#050505" metalness={0.6} roughness={0.4} />
      </mesh>
      {Array.from({ length: cells * cells }, (_, i) => {
        const cx = i % cells;
        const cz = Math.floor(i / cells);
        const c = palette[(cx + cz) % 2];
        return (
          <mesh
            key={i}
            ref={(m) => {
              refs.current[i] = m;
            }}
            position={[(cx - (cells - 1) / 2) * cell, 0.05, (cz - (cells - 1) / 2) * cell]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[cell * 0.94, cell * 0.94]} />
            <meshStandardMaterial color="#111" emissive={c} emissiveIntensity={0.8} roughness={0.2} />
          </mesh>
        );
      })}
    </group>
  );
});

/** Fuente de chispas sobre cada chispero; la máquina es un modelo .glb aparte. */
export const ColdSpark = memo(function ColdSpark({ item, height, animate }: { item: SceneItem; height: number; animate: boolean }) {
  const fountain = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!animate || !fountain.current) return;
    const s = 0.85 + 0.15 * Math.sin(clock.elapsedTime * 9 + item.position[0] * 3);
    fountain.current.scale.set(1, s, 1);
  });
  return (
    <group position={item.position}>
      <mesh ref={fountain} position={[0, 0.27 + height / 2, 0]}>
        <coneGeometry args={[0.13, height, 12, 1, true]} />
        <meshBasicMaterial color="#ffe9b0" transparent opacity={0.22} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
      </mesh>
    </group>
  );
});

/** Haz de luz de una cabeza móvil. */
export const LightBeam = memo(function LightBeam({ item, color, index }: { item: SceneItem; color: string; index: number }) {
  const pivot = useRef<Mesh>(null);
  const length = 6;
  useFrame(({ clock }) => {
    if (!pivot.current) return;
    const t = clock.elapsedTime * 0.6 + index * 1.3;
    pivot.current.rotation.set(-0.9 + 0.35 * Math.sin(t), 0, 0.5 * Math.sin(t * 0.7));
  });
  return (
    <group position={[item.position[0], item.position[1] + 0.34, item.position[2]]}>
      <group ref={pivot}>
        <mesh position={[0, length / 2, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.55, length, 16, 1, true]} />
          <meshBasicMaterial color={color} transparent opacity={0.1} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
        </mesh>
      </group>
    </group>
  );
});
