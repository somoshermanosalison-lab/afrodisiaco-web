import { formatMXN, type Addon } from '@afrodisiaco/shared';
import { remainingForAddon, useSetup } from '@/services/inventoryService';
import { useCatalogStore } from '@/store/catalogStore';
import { useConfiguratorStore } from '@/store/configuratorStore';
import { track } from '@/utils/analytics';
import { StepHeading } from './StepHeading';

export function AddonSelector() {
  const addons = useCatalogStore((s) => s.catalog.addons);
  const selected = useConfiguratorStore((s) => s.config.addons);
  const setAddonQuantity = useConfiguratorStore((s) => s.setAddonQuantity);
  const setup = useSetup();
  const active = addons.filter((a) => a.active);

  const change = (addon: Addon, quantity: number) => {
    setAddonQuantity(addon.id, quantity);
    if (quantity > (selected[addon.id] ?? 0)) track('addon_selected', { addon: addon.id, quantity });
  };

  return (
    <section aria-labelledby="step-addons">
      <StepHeading eyebrow="Paso 5" title="Súmale lo que quieras" lede="Agrega o quita extras; el montaje y el precio se actualizan al instante." />
      {active.length === 0 ? (
        <p className="rounded-sm border border-line bg-noir-2 px-4 py-6 text-center text-ceniza">Por ahora no hay extras disponibles.</p>
      ) : (
        <ul id="step-addons" className="grid gap-3 sm:grid-cols-2">
          {active.map((addon) => {
            const qty = selected[addon.id] ?? 0;
            const remaining = remainingForAddon(setup, addon, qty);
            const missing = addon.dependencies.filter((d) => !selected[d]);
            const blocked = missing.length > 0 && qty === 0;
            return (
              <li
                key={addon.id}
                className={`flex flex-col rounded-md border p-4 transition ${qty > 0 ? 'border-champan bg-noir-3' : 'border-line bg-noir-2'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-bold leading-snug">{addon.name}</h3>
                  <span className="whitespace-nowrap text-sm text-champan">
                    +{formatMXN(addon.price)}
                    {addon.maxQuantity > 1 && <span className="text-ceniza"> c/u</span>}
                  </span>
                </div>
                <p className="mt-1 flex-1 text-sm text-ceniza">{addon.description}</p>
                {addon.requiresApproval && <p className="mt-2 text-xs text-ceniza">Sujeto a que el lugar lo permita.</p>}
                {blocked && (
                  <p className="mt-2 text-xs text-ember">
                    Requiere: {missing.map((d) => addons.find((a) => a.id === d)?.name ?? d).join(', ')}
                  </p>
                )}
                <div className="mt-3">
                  {addon.maxQuantity === 1 ? (
                    <button
                      type="button"
                      aria-pressed={qty > 0}
                      disabled={blocked || (qty === 0 && remaining < 1)}
                      onClick={() => change(addon, qty > 0 ? 0 : 1)}
                      className={`min-h-11 w-full rounded-sm px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        qty > 0 ? 'bg-champan text-noir' : 'border border-line hover:border-champan'
                      }`}
                    >
                      {qty > 0 ? 'Agregado · quitar' : remaining < 1 ? 'Sin disponibilidad' : 'Agregar'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3" role="group" aria-label={`Cantidad de ${addon.name}`}>
                      <button
                        type="button"
                        aria-label={`Quitar una unidad de ${addon.name}`}
                        disabled={qty === 0}
                        onClick={() => change(addon, qty - 1)}
                        className="h-11 w-11 rounded-sm border border-line text-xl transition hover:border-champan disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        −
                      </button>
                      <output aria-live="polite" className="w-8 text-center font-display text-xl font-bold tabular-nums">
                        {qty}
                      </output>
                      <button
                        type="button"
                        aria-label={`Agregar una unidad de ${addon.name}`}
                        disabled={blocked || remaining < 1}
                        onClick={() => change(addon, qty + 1)}
                        className="h-11 w-11 rounded-sm border border-line text-xl transition hover:border-champan disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                      <span className="text-xs text-ceniza">
                        {remaining < 1 ? 'Máximo disponible' : `hasta ${qty + remaining}`}
                      </span>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
