export type AnalyticsEvent =
  | 'configurator_started'
  | 'event_type_selected'
  | 'production_selected'
  | 'addon_selected'
  | 'configuration_completed'
  | 'quote_requested'
  | 'whatsapp_clicked';

type Params = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Registra un evento de uso. Solo se envían datos de la configuración (tipo de
 * evento, paquete, extra): nunca nombre, teléfono, correo ni comentarios.
 * Funciona con Google Tag Manager / GA4 si `window.dataLayer` existe; si no, no hace nada.
 */
export function track(event: AnalyticsEvent, params: Params = {}): void {
  try {
    window.dataLayer?.push({ event, ...params });
  } catch {
    // La analítica nunca debe romper el configurador.
  }
}
