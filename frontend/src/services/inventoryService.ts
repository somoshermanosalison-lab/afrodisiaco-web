import { resolveSetup, type ResolvedSetup } from '@afrodisiaco/shared';
import { useMemo } from 'react';
import { useCatalogStore } from '@/store/catalogStore';
import { useConfiguratorStore } from '@/store/configuratorStore';

/** Equipo, recomendaciones y avisos de la configuración actual, según las reglas de negocio. */
export function useSetup(): ResolvedSetup {
  const config = useConfiguratorStore((s) => s.config);
  const catalog = useCatalogStore((s) => s.catalog);
  return useMemo(() => resolveSetup(config, catalog), [config, catalog]);
}

/** Unidades que todavía se pueden agregar de un extra sin pasar el inventario ni su máximo. */
export function remainingForAddon(
  setup: ResolvedSetup,
  addon: { id: string; equipmentId: string | null; maxQuantity: number },
  currentQuantity: number,
): number {
  const byMax = addon.maxQuantity - currentQuantity;
  if (!addon.equipmentId) return byMax;
  const line = setup.equipment.find((l) => l.equipment.id === addon.equipmentId);
  if (!line) return byMax;
  return Math.min(byMax, line.equipment.quantityAvailable - line.quantity);
}
