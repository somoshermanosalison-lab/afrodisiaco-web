import { formatMXN } from '@afrodisiaco/shared';
import { SelectableCard } from '@/components/ui/SelectableCard';
import { useSetup } from '@/services/inventoryService';
import { useCatalogStore } from '@/store/catalogStore';
import { useConfiguratorStore } from '@/store/configuratorStore';
import { track } from '@/utils/analytics';
import { StepHeading } from './StepHeading';

export function ProductionSelector() {
  const packages = useCatalogStore((s) => s.catalog.packages);
  const level = useConfiguratorStore((s) => s.config.level);
  const setLevel = useConfiguratorStore((s) => s.setLevel);
  const { recommendedLevel } = useSetup();

  return (
    <section aria-labelledby="step-level">
      <StepHeading eyebrow="Paso 4" title="Elige el nivel de producción" lede="Cada nivel incluye montaje, desmontaje, cableado oculto y prueba de sonido." />
      <div id="step-level" role="radiogroup" aria-label="Nivel de producción" className="grid gap-4">
        {packages.map((p) => (
          <SelectableCard
            key={p.id}
            selected={level === p.id}
            badge={recommendedLevel === p.id ? 'Recomendado' : undefined}
            onSelect={() => {
              setLevel(p.id);
              track('production_selected', { level: p.id });
            }}
            className="!p-0 overflow-hidden"
          >
            <span className="flex flex-col sm:flex-row">
              <img
                src={p.image}
                alt={`Montaje del paquete ${p.name}`}
                loading="lazy"
                decoding="async"
                onError={(e) => e.currentTarget.remove()}
                className="h-36 w-full bg-noir-3 object-cover sm:h-auto sm:w-44"
              />
              <span className="block flex-1 p-4">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="font-impact text-2xl uppercase tracking-wide">{p.name}</span>
                  <span className="text-sm text-ceniza">
                    desde <b className="font-display text-xl font-black text-humo">{formatMXN(p.basePrice)}</b> / {p.hours} hrs
                  </span>
                </span>
                <span className="mt-1 block text-sm text-champan">{p.description}</span>
                <span className="mt-3 grid gap-x-4 gap-y-1 text-sm text-ceniza sm:grid-cols-2">
                  {p.highlights.map((h) => (
                    <span key={h} className="flex gap-2">
                      <span aria-hidden="true" className="text-ember">✓</span>
                      {h}
                    </span>
                  ))}
                </span>
                <span className={`mt-4 inline-block rounded-sm px-4 py-2 text-sm font-medium ${level === p.id ? 'bg-champan text-noir' : 'border border-line'}`}>
                  {level === p.id ? 'Seleccionado' : `Elegir ${p.name}`}
                </span>
              </span>
            </span>
          </SelectableCard>
        ))}
      </div>
    </section>
  );
}
