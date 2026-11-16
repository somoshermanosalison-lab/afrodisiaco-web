import type { EquipmentCategory } from '@afrodisiaco/shared';
import { useSetup } from '@/services/inventoryService';

const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  sound: 'Sonido',
  lighting: 'Iluminación',
  led: 'Pantallas y pista',
  effects: 'Efectos y show',
  dj: 'DJ y staff',
  staging: 'Estructura',
};

export function EquipmentSummary() {
  const { equipment } = useSetup();
  if (equipment.length === 0) {
    return <p className="text-sm text-ceniza">Elige un nivel de producción para ver el equipo de tu evento.</p>;
  }
  const categories = (Object.keys(CATEGORY_LABELS) as EquipmentCategory[]).filter((c) =>
    equipment.some((l) => l.equipment.category === c),
  );

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <div key={category}>
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <span aria-hidden="true" className="text-champan">✓</span>
            {CATEGORY_LABELS[category]}
          </h4>
          <ul className="ml-5 mt-1 space-y-0.5 text-sm text-ceniza">
            {equipment
              .filter((l) => l.equipment.category === category)
              .map((l) => (
                <li key={l.equipment.id}>
                  <span className="tabular-nums text-humo">{l.quantity}×</span> {l.equipment.name}
                  {l.fromAddons > 0 && <span className="text-champan"> (+{l.fromAddons} extra)</span>}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
