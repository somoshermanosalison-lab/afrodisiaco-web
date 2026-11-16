import { useGLTF } from '@react-three/drei';
import { Suspense, memo, useMemo } from 'react';
import type { Mesh } from 'three';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useViewerStore } from '@/store/viewerStore';
import { assetUrl } from '@/utils/device';
import { Label } from './Label';
import type { SceneItem } from './layout';

/** Caja con etiqueta para equipo que todavía no tiene modelo 3D (o cuyo modelo falló). */
export function Placeholder({ item, failed = false }: { item: SceneItem; failed?: boolean }) {
  const [w, h, d] = item.size;
  return (
    <group position={[0, h / 2, 0]}>
      <mesh>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={failed ? '#c4324c' : '#c6a15b'} transparent opacity={0.22} />
      </mesh>
      <mesh>
        <boxGeometry args={[w, h, d]} />
        <meshBasicMaterial color={failed ? '#c4324c' : '#c6a15b'} wireframe />
      </mesh>
      <Label
        text={`${item.label} · ${failed ? 'no se pudo cargar' : 'modelo 3D pendiente'}`}
        position={[0, h / 2 + 0.3, 0]}
        color={failed ? '#c4324c' : '#c6a15b'}
      />
    </group>
  );
}

function GlbModel({ url, castShadow }: { url: string; castShadow: boolean }) {
  const { scene } = useGLTF(url, false);
  // Cada instancia clona el grafo pero comparte geometría y materiales.
  const object = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((o) => {
      if ((o as Mesh).isMesh) o.castShadow = castShadow;
    });
    return clone;
  }, [scene, castShadow]);
  return <primitive object={object} />;
}

interface Props {
  item: SceneItem;
  castShadow: boolean;
}

/**
 * Dibuja un equipo: su .glb si existe, o un placeholder identificado si no.
 * Si el modelo falla al cargar, se registra el error y se muestra el placeholder;
 * el resto del configurador sigue funcionando.
 */
export const EquipmentModel = memo(function EquipmentModel({ item, castShadow }: Props) {
  const reportModelError = useViewerStore((s) => s.reportModelError);
  const url = item.modelUrl ? assetUrl(item.modelUrl) : null;

  return (
    <group position={item.position} rotation={item.rotation}>
      {url ? (
        <ErrorBoundary
          fallback={<Placeholder item={item} failed />}
          onError={(err) => {
            console.error(`[3d] no se pudo cargar ${url}:`, err.message);
            reportModelError(url);
          }}
        >
          <Suspense fallback={null}>
            <GlbModel url={url} castShadow={castShadow} />
          </Suspense>
        </ErrorBoundary>
      ) : (
        <Placeholder item={item} />
      )}
    </group>
  );
});
