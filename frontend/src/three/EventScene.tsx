import type { EquipmentLine, LightingTheme, VenueDimensions } from '@afrodisiaco/shared';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { PointLight } from 'three';
import { CameraControls } from './CameraControls';
import { EquipmentModel } from './EquipmentModel';
import { buildSceneLayout } from './layout';
import { ColdSpark, LedFloor, LightBeam, Pole, Post, ScreenContent } from './Procedural';
import { Stage } from './Stage';

const MAX_BEAMS = 8;

interface Props {
  equipment: EquipmentLine[];
  venue: VenueDimensions;
  lighting: LightingTheme;
  lowPower: boolean;
}

function ThemeLights({ lighting, venue, animate }: { lighting: LightingTheme; venue: VenueDimensions; animate: boolean }) {
  const a = useRef<PointLight>(null);
  const b = useRef<PointLight>(null);
  useFrame(({ clock }) => {
    if (!animate || !lighting.dynamic || !a.current || !b.current) return;
    const t = clock.elapsedTime;
    a.current.intensity = 26 + 12 * Math.sin(t * 1.3);
    b.current.intensity = 26 + 12 * Math.sin(t * 1.3 + Math.PI);
  });
  const z = -venue.length / 2 + 2.2;
  const y = Math.min(venue.height - 0.3, 3);
  const x = Math.min(venue.width / 2 - 0.5, 3.5);
  return (
    <>
      <pointLight ref={a} position={[-x, y, z]} color={lighting.primary} intensity={30} distance={18} decay={1.6} />
      <pointLight ref={b} position={[x, y, z]} color={lighting.secondary} intensity={30} distance={18} decay={1.6} />
    </>
  );
}

/** Escena completa: salón a escala, montaje según la configuración, luces y cámara. */
export function EventScene({ equipment, venue, lighting, lowPower }: Props) {
  const layout = useMemo(() => buildSceneLayout(equipment, venue), [equipment, venue]);
  const sparkHeight = Math.min(1.5, Math.max(0.8, venue.height - 1.5));
  const colors = useMemo<[string, string]>(() => [lighting.primary, lighting.secondary], [lighting.primary, lighting.secondary]);
  let beams = 0;

  return (
    <>
      <color attach="background" args={['#0c0a0d']} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#ffffff', '#1a1418', 0.5]} />
      <directionalLight
        position={[3, Math.max(6, venue.height + 2), venue.length / 2]}
        intensity={1.1}
        castShadow={!lowPower}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-venue.width / 2}
        shadow-camera-right={venue.width / 2}
        shadow-camera-top={venue.length / 2}
        shadow-camera-bottom={-venue.length / 2}
      />
      <ThemeLights lighting={lighting} venue={venue} animate={!lowPower} />

      <Stage venue={venue} receiveShadow={!lowPower} />

      {/* Todo el montaje se coloca relativo al muro del fondo. */}
      <group position={[0, 0, -venue.length / 2]}>
        {layout.items.map((item, i) => {
          switch (item.kind) {
            case 'pole':
              return <Pole key={item.key} item={item} />;
            case 'post':
              return <Post key={item.key} item={item} />;
            case 'screen-content':
              return <ScreenContent key={item.key} item={item} color={lighting.primary} />;
            case 'led-floor':
              return <LedFloor key={item.key} item={item} colors={colors} animate={!lowPower} />;
            case 'cold-spark':
              return (
                <group key={item.key}>
                  <EquipmentModel item={item} castShadow={!lowPower} />
                  <ColdSpark item={item} height={sparkHeight} animate={!lowPower} />
                </group>
              );
            default: {
              const showBeam = item.beam && !lowPower && beams++ < MAX_BEAMS;
              return (
                <group key={item.key}>
                  <EquipmentModel item={item} castShadow={!lowPower} />
                  {showBeam && <LightBeam item={item} color={i % 2 === 0 ? lighting.primary : lighting.secondary} index={i} />}
                </group>
              );
            }
          }
        })}
      </group>

      <CameraControls venue={venue} animate={!lowPower} />
    </>
  );
}
