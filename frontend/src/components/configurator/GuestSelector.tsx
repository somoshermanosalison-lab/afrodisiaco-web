import { LIMITS } from '@afrodisiaco/shared';
import { NumberField } from '@/components/ui/NumberField';
import { useSetup } from '@/services/inventoryService';
import { useCatalogStore } from '@/store/catalogStore';
import { useConfiguratorStore } from '@/store/configuratorStore';
import { StepHeading } from './StepHeading';

const PRESETS = [
  { value: 50, label: '50' },
  { value: 100, label: '100' },
  { value: 150, label: '150' },
  { value: 200, label: '200' },
  { value: 300, label: '300' },
  { value: 500, label: '500+' },
];

export function GuestSelector() {
  const guests = useConfiguratorStore((s) => s.config.guests);
  const setGuests = useConfiguratorStore((s) => s.setGuests);
  const packages = useCatalogStore((s) => s.catalog.packages);
  const { recommendedLevel } = useSetup();
  const recommended = packages.find((p) => p.id === recommendedLevel);

  return (
    <section aria-labelledby="step-guests">
      <StepHeading eyebrow="Paso 2" title="¿Cuántos invitados esperas?" lede="Un aproximado basta: con eso calculamos el audio que necesitas." />
      <div id="step-guests" role="radiogroup" aria-label="Número de invitados" className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            role="radio"
            aria-checked={guests === p.value}
            onClick={() => setGuests(p.value)}
            className={`min-h-12 rounded-sm border text-base font-medium transition ${
              guests === p.value ? 'border-champan bg-noir-3 text-champan' : 'border-line bg-noir-2 hover:border-ceniza'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="max-w-xs">
        <NumberField label="O escribe el número" value={guests} min={LIMITS.guests.min} max={LIMITS.guests.max} integer onChange={setGuests} />
      </div>
      {recommended && (
        <p className="mt-5 rounded-sm border border-line bg-noir-2 px-4 py-3 text-sm" aria-live="polite">
          Con <b className="font-semibold text-humo">{guests} invitados</b> recomendamos aproximadamente el nivel{' '}
          <b className="font-semibold text-champan">{recommended.name}</b>.
        </p>
      )}
    </section>
  );
}
