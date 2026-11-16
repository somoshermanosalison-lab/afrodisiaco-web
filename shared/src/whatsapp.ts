import { formatMXN } from './pricing';
import { sanitizeAddons } from './rules';
import type { Catalog, Configuration, PriceBreakdown } from './types';

export interface WhatsAppExtras {
  customerName?: string;
  /** Fecha en formato AAAA-MM-DD. */
  eventDate?: string;
  city?: string;
  comments?: string;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

/** Arma el mensaje de cotización a partir de la configuración; nada se escribe a mano. */
export function buildWhatsAppMessage(
  config: Configuration,
  catalog: Catalog,
  price: PriceBreakdown,
  extras: WhatsAppExtras = {},
): string {
  const event = catalog.eventTypes.find((e) => e.id === config.eventType);
  const pkg = catalog.packages.find((p) => p.id === config.level);
  const addons = sanitizeAddons(config.addons, catalog);
  const addonLines = catalog.addons
    .filter((a) => addons[a.id])
    .map((a) => `- ${a.name}${addons[a.id] > 1 ? ` × ${addons[a.id]}` : ''}`);

  const lines = ['Hola, quiero cotizar un evento con Afrodísiaco.', ''];
  if (extras.customerName) lines.push(`Nombre: ${extras.customerName}`);
  lines.push(`Evento: ${event?.name ?? 'Por definir'}`);
  if (extras.eventDate) lines.push(`Fecha: ${formatDate(extras.eventDate)}`);
  if (extras.city) lines.push(`Ciudad: ${extras.city}`);
  lines.push(`Invitados: ${config.guests}`);
  lines.push(`Espacio: ${config.venue.width} × ${config.venue.length} m (altura ${config.venue.height} m)`);
  lines.push(`Producción: ${pkg?.name ?? 'Por definir'}`);
  lines.push('');
  if (addonLines.length) lines.push('Extras:', ...addonLines, '');
  lines.push(`Precio estimado: ${formatMXN(price.total)}`);
  if (extras.comments) lines.push('', `Comentarios: ${extras.comments}`);
  lines.push('', 'Me gustaría recibir una cotización.');
  return lines.join('\n');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}
