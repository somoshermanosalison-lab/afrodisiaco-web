import { calculatePrice, type PriceBreakdown } from '@afrodisiaco/shared';
import { useMemo } from 'react';
import { useCatalogStore } from '@/store/catalogStore';
import { useConfiguratorStore } from '@/store/configuratorStore';

/** Precio estimado de la configuración actual. Los componentes nunca calculan precios por su cuenta. */
export function usePrice(): PriceBreakdown {
  const config = useConfiguratorStore((s) => s.config);
  const catalog = useCatalogStore((s) => s.catalog);
  return useMemo(() => calculatePrice(config, catalog), [config, catalog]);
}
