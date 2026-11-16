import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useSetup } from '@/services/inventoryService';
import { useCatalogStore } from '@/store/catalogStore';
import { useConfiguratorStore } from '@/store/configuratorStore';
import { type CameraView, useViewerStore } from '@/store/viewerStore';
import { EventScene } from '@/three/EventScene';
import { useDeviceProfile } from '@/utils/device';

const VIEWS: { id: CameraView; label: string }[] = [
  { id: 'front', label: 'Vista frontal' },
  { id: 'top', label: 'Vista superior' },
  { id: 'full', label: 'Vista completa' },
];

const DEFAULT_LIGHTING = { primary: '#c4324c', secondary: '#c6a15b', dynamic: true };

/** Vista 3D del montaje con sus controles de cámara. Se carga aparte del resto de la app. */
export default function ThreeDViewer() {
  const venue = useConfiguratorStore((s) => s.config.venue);
  const eventType = useConfiguratorStore((s) => s.config.eventType);
  const eventTypes = useCatalogStore((s) => s.catalog.eventTypes);
  const { equipment } = useSetup();
  const { lowPower } = useDeviceProfile();
  const view = useViewerStore((s) => s.view);
  const setView = useViewerStore((s) => s.setView);
  const failedModels = useViewerStore((s) => s.failedModels);
  const lighting = eventTypes.find((e) => e.id === eventType)?.lighting ?? DEFAULT_LIGHTING;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md border border-line bg-noir">
      <ErrorBoundary
        fallback={
          <p role="alert" className="flex h-full items-center justify-center p-6 text-center text-sm text-ceniza">
            Tu dispositivo no pudo mostrar la vista 3D. Puedes continuar con tu configuración.
          </p>
        }
      >
        <Canvas
          shadows={!lowPower}
          dpr={lowPower ? 1 : [1, 1.75]}
          gl={{ antialias: !lowPower, powerPreference: lowPower ? 'low-power' : 'high-performance' }}
          camera={{ fov: 45, near: 0.1, far: 600, position: [8, 8, 16] }}
          // En equipos modestos solo se redibuja cuando algo cambia.
          frameloop={lowPower ? 'demand' : 'always'}
          aria-label="Vista 3D del montaje de tu evento"
          role="img"
        >
          <Suspense fallback={null}>
            <EventScene equipment={equipment} venue={venue} lighting={lighting} lowPower={lowPower} />
          </Suspense>
        </Canvas>
      </ErrorBoundary>

      {equipment.length === 0 && (
        <p className="pointer-events-none absolute inset-x-0 top-1/3 px-6 text-center text-sm text-ceniza">
          Elige un nivel de producción para ver tu montaje.
        </p>
      )}

      <div className="absolute inset-x-2 bottom-2 flex flex-wrap justify-center gap-1.5" role="group" aria-label="Controles de cámara">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            aria-pressed={view === v.id}
            onClick={() => setView(v.id)}
            className={`rounded-sm border px-3 py-1.5 text-xs backdrop-blur transition ${
              view === v.id ? 'border-champan bg-noir/80 text-champan' : 'border-line bg-noir/70 text-humo hover:border-ceniza'
            }`}
          >
            {v.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setView('stage')}
          className="rounded-sm border border-line bg-noir/70 px-3 py-1.5 text-xs text-humo backdrop-blur transition hover:border-ceniza"
        >
          Reset cámara
        </button>
      </div>

      {failedModels.length > 0 && (
        <p role="status" className="absolute inset-x-2 top-2 rounded-sm border border-ember/60 bg-noir/90 px-3 py-2 text-xs text-humo">
          Este elemento no pudo cargarse. Puedes continuar con tu configuración.
        </p>
      )}
    </div>
  );
}
