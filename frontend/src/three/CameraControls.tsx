import type { VenueDimensions } from '@afrodisiaco/shared';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { MathUtils, type PerspectiveCamera, Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { type CameraView, useViewerStore } from '@/store/viewerStore';

interface Goal {
  position: Vector3;
  target: Vector3;
  maxDistance: number;
}

/** Posición de cámara que encuadra el salón completo para cada vista. */
function computeGoal(view: CameraView, venue: VenueDimensions, fovDeg: number, aspect: number): Goal {
  const { width, length, height } = venue;
  const fovV = MathUtils.degToRad(fovDeg);
  const fovH = 2 * Math.atan(Math.tan(fovV / 2) * aspect);
  const fit = (size: number, fov: number) => size / 2 / Math.tan(fov / 2);
  const radius = 0.5 * Math.hypot(width, length, height);
  const fullDistance = (radius / Math.sin(Math.min(fovV, fovH) / 2)) * 1.02;
  const maxDistance = fullDistance * 2.2;

  if (view === 'top') {
    const d = Math.max(fit(length, fovV), fit(width, fovH)) * 1.12;
    return { position: new Vector3(0, d, 0.01), target: new Vector3(0, 0, 0), maxDistance };
  }
  if (view === 'front') {
    const stageZ = -length / 2 + 1.5;
    const d = Math.max(fit(Math.min(width, 9) + 1.5, fovH), fit(Math.min(height, 4) + 1, fovV), 4);
    return { position: new Vector3(0, 1.6, stageZ + d), target: new Vector3(0, 1.3, stageZ), maxDistance };
  }
  if (view === 'stage') {
    // Vista inicial: el montaje en tres cuartos, de cerca.
    const stageZ = -length / 2 + 1.8;
    const d = Math.max(fit(Math.min(width, 10) + 2, fovH), fit(Math.min(height, 4) + 1.5, fovV), 5) * 1.05;
    const target = new Vector3(0, 1.2, stageZ);
    return { position: target.clone().addScaledVector(new Vector3(0.5, 0.32, 1).normalize(), d), target, maxDistance };
  }
  const dir = new Vector3(0.55, 0.5, 1).normalize();
  const target = new Vector3(0, height * 0.25, 0);
  return { position: target.clone().addScaledVector(dir, fullDistance), target, maxDistance };
}

/** Órbita, zoom y desplazamiento, más el re-encuadre automático al cambiar vista o medidas. */
export function CameraControls({ venue, animate }: { venue: VenueDimensions; animate: boolean }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const invalidate = useThree((s) => s.invalidate);
  const view = useViewerStore((s) => s.view);
  const nonce = useViewerStore((s) => s.nonce);
  const moving = useRef(false);

  const goal = useMemo(
    () => computeGoal(view, venue, camera.fov, aspect),
    // `nonce` fuerza el re-encuadre aunque se pida la misma vista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view, nonce, venue.width, venue.length, venue.height, camera.fov, aspect],
  );

  useEffect(() => {
    if (animate) {
      moving.current = true;
    } else {
      camera.position.copy(goal.position);
      controls.current?.target.copy(goal.target);
      controls.current?.update();
    }
    invalidate();
  }, [goal, animate, camera, invalidate]);

  useFrame((_, delta) => {
    if (!moving.current || !controls.current) return;
    const k = 1 - Math.exp(-delta * 5);
    camera.position.lerp(goal.position, k);
    controls.current.target.lerp(goal.target, k);
    controls.current.update();
    if (camera.position.distanceTo(goal.position) < 0.02) moving.current = false;
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.1}
      minDistance={1.5}
      maxDistance={goal.maxDistance}
      maxPolarAngle={Math.PI / 2 - 0.03}
      onStart={() => {
        moving.current = false;
      }}
    />
  );
}
