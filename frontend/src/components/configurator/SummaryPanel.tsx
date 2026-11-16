import { sanitizeAddons } from '@afrodisiaco/shared';
import { NoticeList } from '@/components/ui/NoticeList';
import { useSetup } from '@/services/inventoryService';
import { useCatalogStore } from '@/store/catalogStore';
import { useConfiguratorStore } from '@/store/configuratorStore';
import { EquipmentSummary } from './EquipmentSummary';
import { PriceSummary } from './PriceSummary';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <dt className="text-ceniza">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

/** Resumen completo de la configuración; se actualiza en tiempo real. */
export function SummaryPanel() {
  const config = useConfiguratorStore((s) => s.config);
  const catalog = useCatalogStore((s) => s.catalog);
  const setup = useSetup();

  const event = catalog.eventTypes.find((e) => e.id === config.eventType);
  const pkg = catalog.packages.find((p) => p.id === config.level);
  const addons = sanitizeAddons(config.addons, catalog);
  const selectedAddons = catalog.addons.filter((a) => addons[a.id]);

  return (
    <aside aria-label="Resumen de tu evento" className="rounded-md border border-line bg-noir-2 p-5">
      <h2 className="font-impact text-2xl uppercase tracking-wide">Tu evento</h2>
      <dl className="mt-3 divide-y divide-line text-sm">
        <Row label="Tipo" value={event?.name ?? 'Por elegir'} />
        <Row label="Invitados" value={String(config.guests)} />
        <Row label="Espacio" value={`${config.venue.width} m × ${config.venue.length} m`} />
        <Row label="Producción" value={pkg?.name ?? 'Por elegir'} />
      </dl>

      <h3 className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-ceniza">Equipo</h3>
      <EquipmentSummary />

      <h3 className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-ceniza">Extras</h3>
      {selectedAddons.length === 0 ? (
        <p className="text-sm text-ceniza">Sin extras por ahora.</p>
      ) : (
        <ul className="space-y-0.5 text-sm">
          {selectedAddons.map((a) => (
            <li key={a.id} className="flex gap-2">
              <span aria-hidden="true" className="text-champan">✓</span>
              {a.name}
              {addons[a.id] > 1 && <span className="text-ceniza">× {addons[a.id]}</span>}
            </li>
          ))}
        </ul>
      )}

      {setup.notices.length > 0 && (
        <div className="mt-5">
          <NoticeList notices={setup.notices} />
        </div>
      )}

      <div className="mt-5 border-t border-line pt-5">
        <PriceSummary />
      </div>
    </aside>
  );
}
