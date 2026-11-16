import { formatMXN } from '@afrodisiaco/shared';
import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddonSelector } from '@/components/configurator/AddonSelector';
import { ConfiguratorStepper } from '@/components/configurator/ConfiguratorStepper';
import { EventTypeSelector } from '@/components/configurator/EventTypeSelector';
import { GuestSelector } from '@/components/configurator/GuestSelector';
import { ProductionSelector } from '@/components/configurator/ProductionSelector';
import { ShareButton } from '@/components/configurator/ShareButton';
import { SummaryPanel } from '@/components/configurator/SummaryPanel';
import { VenueDimensions } from '@/components/configurator/VenueDimensions';
import { ViewerFallback } from '@/components/three/ViewerFallback';
import { Button } from '@/components/ui/Button';
import { useSetup } from '@/services/inventoryService';
import { usePrice } from '@/services/pricingService';
import { useCatalogStore } from '@/store/catalogStore';
import { STEPS, loadSharedConfigurationFromUrl, useConfiguratorStore } from '@/store/configuratorStore';
import { track } from '@/utils/analytics';

// La escena 3D (three.js y modelos) se descarga aparte, solo cuando se muestra.
const ThreeDViewer = lazy(() => import('@/components/three/ThreeDViewer'));

const STEP_COMPONENTS = [EventTypeSelector, GuestSelector, VenueDimensions, ProductionSelector, AddonSelector];

export default function ConfiguratorPage() {
  const navigate = useNavigate();
  const step = useConfiguratorStore((s) => s.step);
  const setStep = useConfiguratorStore((s) => s.setStep);
  const reset = useConfiguratorStore((s) => s.reset);
  const config = useConfiguratorStore((s) => s.config);
  const catalogStatus = useCatalogStore((s) => s.status);
  const setup = useSetup();
  const price = usePrice();
  const [sharedLoaded, setSharedLoaded] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    // Solo se marca en verdadero: en desarrollo el efecto corre dos veces y la URL ya está limpia.
    if (loadSharedConfigurationFromUrl()) setSharedLoaded(true);
    if (!started.current) {
      started.current = true;
      track('configurator_started');
    }
  }, []);

  const completed = [config.eventType !== null, true, true, config.level !== null, true];
  const isLast = step === STEPS.length - 1;
  const ready = config.eventType !== null && config.level !== null && setup.inventoryOk;
  const missing =
    config.eventType === null ? 'Elige el tipo de evento' : config.level === null ? 'Elige un nivel de producción' : !setup.inventoryOk ? 'Ajusta los extras: no hay suficientes unidades' : null;
  const canAdvance = completed[step];
  const Step = STEP_COMPONENTS[step];

  const next = () => {
    if (!isLast) return setStep(step + 1);
    if (!ready) return;
    track('configuration_completed', { level: config.level ?? '', event_type: config.eventType ?? '', total: price.total });
    navigate('/cotizacion');
  };

  return (
    <div className="mx-auto grid max-w-[1500px] gap-6 px-4 pb-28 pt-5 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] lg:px-6 lg:pb-10">
      <h1 className="sr-only">Arma tu evento en 3D</h1>

      {/* Vista 3D + resumen: arriba en móvil, columna fija a la derecha en escritorio. */}
      <div className="lg:order-2">
        <div className="lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100dvh-5.5rem)] lg:overflow-y-auto lg:pr-1">
          <div className="h-[42vh] min-h-64 lg:h-[52vh]">
            <Suspense fallback={<ViewerFallback />}>
              <ThreeDViewer />
            </Suspense>
          </div>
          <div className="mt-4 hidden lg:block">
            <SummaryPanel />
          </div>
        </div>
      </div>

      <div className="lg:order-1">
        {sharedLoaded && (
          <p role="status" className="mb-4 rounded-sm border border-champan/50 bg-noir-2 px-4 py-2 text-sm text-champan">
            Cargamos la configuración del enlace compartido.
          </p>
        )}
        {catalogStatus === 'fallback' && (
          <p role="status" className="mb-4 rounded-sm border border-line bg-noir-2 px-4 py-2 text-sm text-ceniza">
            No pudimos actualizar los datos. Mostramos precios de referencia;{' '}
            <button type="button" className="underline hover:text-humo" onClick={() => void useCatalogStore.getState().load()}>
              intenta nuevamente
            </button>
            .
          </p>
        )}

        <ConfiguratorStepper current={step} completed={completed} onSelect={setStep} />

        <div className="mt-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
              <Step />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 hidden items-center justify-between gap-3 lg:flex">
          <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 0}>
            ← Atrás
          </Button>
          <div className="flex items-center gap-3">
            {isLast && missing && <span className="text-sm text-ember">{missing}</span>}
            {!isLast && !canAdvance && <span className="text-sm text-ceniza">Elige una opción para continuar</span>}
            <Button variant={isLast ? 'gold' : 'primary'} onClick={next} disabled={isLast ? !ready : !canAdvance}>
              {isLast ? 'Solicitar cotización' : 'Siguiente →'}
            </Button>
          </div>
        </div>

        <div className="mt-8 lg:hidden">
          <SummaryPanel />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <ShareButton />
          <Button
            variant="ghost"
            onClick={() => {
              if (window.confirm('¿Borrar tu configuración y empezar de nuevo?')) reset();
            }}
          >
            Empezar de nuevo
          </Button>
        </div>
      </div>

      {/* Barra fija en móvil y tablet: precio y navegación siempre a la mano. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-noir/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
            aria-label="Paso anterior"
            className="h-12 w-12 shrink-0 rounded-sm border border-line text-lg disabled:opacity-30"
          >
            ←
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ceniza">Estimado</p>
            <p className="truncate font-display text-xl font-black text-champan tabular-nums" aria-live="polite">
              {price.total > 0 ? formatMXN(price.total) : '—'}
            </p>
          </div>
          <Button variant={isLast ? 'gold' : 'primary'} onClick={next} disabled={isLast ? !ready : !canAdvance} className="shrink-0 !px-5">
            {isLast ? 'Cotizar' : 'Siguiente'}
          </Button>
        </div>
        {isLast && missing && <p className="mx-auto mt-1 max-w-xl text-xs text-ember">{missing}</p>}
      </div>
    </div>
  );
}
