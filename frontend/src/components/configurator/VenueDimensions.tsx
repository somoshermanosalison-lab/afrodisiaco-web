import { LIMITS } from '@afrodisiaco/shared';
import { NumberField } from '@/components/ui/NumberField';
import { useSetup } from '@/services/inventoryService';
import { useConfiguratorStore } from '@/store/configuratorStore';
import { StepHeading } from './StepHeading';

export function VenueDimensions() {
  const venue = useConfiguratorStore((s) => s.config.venue);
  const setVenue = useConfiguratorStore((s) => s.setVenue);
  const { area, volume } = useSetup();

  return (
    <section aria-labelledby="step-venue">
      <StepHeading eyebrow="Paso 3" title="¿Cómo es el espacio?" lede="Medidas aproximadas en metros. La vista 3D se ajusta a tu salón." />
      <div id="step-venue" className="grid gap-4 sm:grid-cols-3">
        <NumberField label="Ancho" unit="m" step={0.5} value={venue.width} min={LIMITS.width.min} max={LIMITS.width.max} onChange={(width) => setVenue({ width })} />
        <NumberField label="Largo" unit="m" step={0.5} value={venue.length} min={LIMITS.length.min} max={LIMITS.length.max} onChange={(length) => setVenue({ length })} />
        <NumberField label="Altura aproximada" unit="m" step={0.1} value={venue.height} min={LIMITS.height.min} max={LIMITS.height.max} onChange={(height) => setVenue({ height })} />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm" aria-live="polite">
        <div className="rounded-sm border border-line bg-noir-2 px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.2em] text-ceniza">Área</dt>
          <dd className="mt-1 font-display text-2xl font-bold tabular-nums">{area} m²</dd>
        </div>
        <div className="rounded-sm border border-line bg-noir-2 px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.2em] text-ceniza">Volumen aproximado</dt>
          <dd className="mt-1 font-display text-2xl font-bold tabular-nums">{volume} m³</dd>
        </div>
      </dl>
    </section>
  );
}
