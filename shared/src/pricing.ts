import { sanitizeAddons } from './rules';
import type { Catalog, Configuration, PriceBreakdown, PriceLine } from './types';

/**
 * Cálculo del precio estimado:
 *   precio base del paquete + (precio de cada extra × cantidad),
 *   más el recargo por complejidad del tipo de evento, redondeado.
 * Frontend y backend usan esta misma función; el backend la vuelve a ejecutar al
 * guardar una cotización, así que el precio que manda el navegador nunca se confía.
 */
export function calculatePrice(config: Configuration, catalog: Catalog): PriceBreakdown {
  const lines: PriceLine[] = [];
  const pkg = catalog.packages.find((p) => p.id === config.level);
  if (pkg) lines.push({ label: `Paquete ${pkg.name} (${pkg.hours} hrs)`, amount: pkg.basePrice });

  const addons = sanitizeAddons(config.addons, catalog);
  for (const addon of catalog.addons) {
    const qty = addons[addon.id];
    if (!qty) continue;
    lines.push({
      label: qty > 1 ? `${addon.name} × ${qty}` : addon.name,
      amount: addon.price * qty,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
  const complexity = catalog.eventTypes.find((e) => e.id === config.eventType)?.complexity ?? 1;
  const complexityAmount = Math.round(subtotal * (complexity - 1));
  const step = Math.max(1, catalog.pricing.roundTo);
  const total = Math.round((subtotal + complexityAmount) / step) * step;

  return { lines, subtotal, complexityAmount, total, currency: catalog.pricing.currency };
}

const formatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

export function formatMXN(amount: number): string {
  return `${formatter.format(amount)} MXN`;
}
