import type { QuoteRequest } from '@afrodisiaco/shared';
import { z } from 'zod';
import { ApiError, apiRequest } from './api';

const responseSchema = z.object({ id: z.string(), estimatedPrice: z.number() });

export type QuoteResult =
  | { ok: true; id: string; estimatedPrice: number }
  | { ok: false; message: string };

/** Envía la cotización. Nunca lanza: devuelve un mensaje apto para el cliente. */
export async function submitQuote(request: QuoteRequest): Promise<QuoteResult> {
  try {
    const body = await apiRequest('/quotes', { method: 'POST', body: JSON.stringify(request) });
    return { ok: true, ...responseSchema.parse(body) };
  } catch (err) {
    console.error('[quote] no se pudo registrar la cotización:', err);
    if (err instanceof ApiError) {
      if (err.status === 409) return { ok: false, message: 'No contamos actualmente con suficientes unidades para esta configuración.' };
      if (err.status === 400) return { ok: false, message: 'Revisa los datos del formulario e intenta nuevamente.' };
      if (err.status === 429) return { ok: false, message: 'Recibimos muchas solicitudes. Intenta de nuevo en unos minutos.' };
    }
    return { ok: false, message: 'No pudimos registrar tu solicitud en línea. Envíala por WhatsApp y te atendemos enseguida.' };
  }
}
