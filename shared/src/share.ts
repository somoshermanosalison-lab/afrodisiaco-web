import { configurationSchema } from './schemas';
import type { Configuration } from './types';

/**
 * Configuración <-> texto para la URL (`?config=...`).
 * Lo que llega de una URL nunca se usa sin pasar por el esquema de validación.
 */

const toBase64Url = (s: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(s)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const fromBase64Url = (s: string) => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

export function encodeConfiguration(config: Configuration): string {
  const compact = {
    e: config.eventType,
    g: config.guests,
    v: [config.venue.width, config.venue.length, config.venue.height],
    l: config.level,
    a: config.addons,
  };
  return toBase64Url(JSON.stringify(compact));
}

export function decodeConfiguration(code: string): Configuration | null {
  if (!code || code.length > 2000 || !/^[A-Za-z0-9_-]+$/.test(code)) return null;
  try {
    const raw: unknown = JSON.parse(fromBase64Url(code));
    if (typeof raw !== 'object' || raw === null) return null;
    const c = raw as Record<string, unknown>;
    const v = Array.isArray(c.v) ? c.v : [];
    const parsed = configurationSchema.safeParse({
      eventType: c.e ?? null,
      guests: c.g,
      venue: { width: v[0], length: v[1], height: v[2] },
      level: c.l ?? null,
      addons: c.a ?? {},
    });
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
