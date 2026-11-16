import { CONTACT, buildWhatsAppMessage, buildWhatsAppUrl, type WhatsAppExtras } from '@afrodisiaco/shared';
import { usePrice } from '@/services/pricingService';
import { useCatalogStore } from '@/store/catalogStore';
import { useConfiguratorStore } from '@/store/configuratorStore';
import { track } from '@/utils/analytics';

interface Props {
  extras?: WhatsAppExtras;
  label?: string;
  className?: string;
}

/** Abre WhatsApp con el mensaje de cotización armado a partir de la configuración actual. */
export function WhatsAppButton({ extras, label = 'Enviar por WhatsApp', className = '' }: Props) {
  const config = useConfiguratorStore((s) => s.config);
  const catalog = useCatalogStore((s) => s.catalog);
  const price = usePrice();
  const href = buildWhatsAppUrl(CONTACT.whatsapp, buildWhatsAppMessage(config, catalog, price, extras));

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('whatsapp_clicked', { level: config.level ?? 'none', event_type: config.eventType ?? 'none' })}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-wa px-6 py-3 text-[15px] font-medium text-noir transition hover:brightness-110 ${className}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
        <path d="M8.5 7.5h1.2l.9 2.1-.7 1a5.6 5.6 0 0 0 3.500 3.500l1-.7 2.100.9v1.200a1.500 1.500 0 0 1-1.500 1.500A8.500 8.500 0 0 1 7 9a1.500 1.500 0 0 1 1.500-1.500Z" />
      </svg>
      {label}
    </a>
  );
}
