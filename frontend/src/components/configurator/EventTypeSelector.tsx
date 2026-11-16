import { SelectableCard } from '@/components/ui/SelectableCard';
import { useCatalogStore } from '@/store/catalogStore';
import { useConfiguratorStore } from '@/store/configuratorStore';
import { track } from '@/utils/analytics';
import { StepHeading } from './StepHeading';

export function EventTypeSelector() {
  const eventTypes = useCatalogStore((s) => s.catalog.eventTypes);
  const selected = useConfiguratorStore((s) => s.config.eventType);
  const setEventType = useConfiguratorStore((s) => s.setEventType);

  return (
    <section aria-labelledby="step-event">
      <StepHeading eyebrow="Paso 1" title="¿Qué vamos a celebrar?" lede="El tipo de evento define el estilo de la iluminación." />
      <div id="step-event" role="radiogroup" aria-label="Tipo de evento" className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {eventTypes.map((e) => (
          <SelectableCard
            key={e.id}
            selected={selected === e.id}
            onSelect={() => {
              setEventType(e.id);
              track('event_type_selected', { event_type: e.id });
            }}
          >
            <span
              aria-hidden="true"
              className="mb-3 block h-1.5 w-12 rounded-full"
              style={{ background: `linear-gradient(90deg, ${e.lighting.primary}, ${e.lighting.secondary})` }}
            />
            <span className="block font-display text-lg font-bold">{e.name}</span>
            <span className="mt-1 block text-sm text-ceniza">{e.description}</span>
          </SelectableCard>
        ))}
      </div>
    </section>
  );
}
