import { completeConfigurationSchema, type CustomerData, type WhatsAppExtras } from '@afrodisiaco/shared';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QuoteForm } from '@/components/configurator/QuoteForm';
import { SummaryPanel } from '@/components/configurator/SummaryPanel';
import { WhatsAppButton } from '@/components/configurator/WhatsAppButton';
import { useSetup } from '@/services/inventoryService';
import { submitQuote } from '@/services/quoteService';
import { useConfiguratorStore } from '@/store/configuratorStore';
import { track } from '@/utils/analytics';

type Status =
  | { kind: 'form' }
  | { kind: 'sending' }
  | { kind: 'sent'; extras: WhatsAppExtras }
  | { kind: 'failed'; message: string; extras: WhatsAppExtras };

const BACK_LINK = 'inline-flex min-h-12 items-center justify-center rounded-sm border border-line px-6 py-3 text-[15px] font-medium transition hover:border-champan hover:text-champan';

export default function QuotePage() {
  const config = useConfiguratorStore((s) => s.config);
  const setup = useSetup();
  const [status, setStatus] = useState<Status>({ kind: 'form' });
  const complete = completeConfigurationSchema.safeParse(config);

  // Estado vacío: no se puede cotizar sin tipo de evento y nivel de producción.
  if (!complete.success || !setup.inventoryOk) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-black">Aún falta armar tu evento</h1>
        <p className="mt-3 text-ceniza">
          {complete.success
            ? 'Tu configuración pide más unidades de las que tenemos disponibles. Ajusta los extras para continuar.'
            : 'Elige el tipo de evento y el nivel de producción para poder cotizar.'}
        </p>
        <Link to="/" className={`${BACK_LINK} mt-6`}>
          Volver al configurador
        </Link>
      </div>
    );
  }

  const send = async (customer: CustomerData) => {
    const extras: WhatsAppExtras = {
      customerName: customer.customerName,
      eventDate: customer.eventDate,
      city: customer.city,
      comments: customer.comments || undefined,
    };
    setStatus({ kind: 'sending' });
    track('quote_requested', { level: complete.data.level, event_type: complete.data.eventType });
    const result = await submitQuote({ customer, configuration: complete.data });
    setStatus(result.ok ? { kind: 'sent', extras } : { kind: 'failed', message: result.message, extras });
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-2 lg:px-6">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-ember">Cotización</p>
        <h1 className="font-display text-4xl font-black leading-tight">Ya casi es tu noche.</h1>

        {status.kind === 'sent' ? (
          <div role="status" className="mt-6 rounded-md border border-champan/50 bg-noir-2 p-6">
            <h2 className="font-display text-2xl font-bold text-champan">Recibimos tu solicitud</h2>
            <p className="mt-2 text-ceniza">Te contactamos pronto con tu cotización. Si quieres acelerarlo, mándanos tu configuración por WhatsApp.</p>
            <WhatsAppButton extras={status.extras} className="mt-5 w-full" />
            <Link to="/" className={`${BACK_LINK} mt-3 w-full`}>
              Volver al configurador
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 mt-3 text-ceniza">Déjanos tus datos y te enviamos la cotización formal de la configuración que armaste.</p>
            {status.kind === 'failed' && (
              <div role="alert" className="mb-6 rounded-md border border-ember/60 bg-noir-2 p-4">
                <p className="text-sm">{status.message}</p>
                <WhatsAppButton extras={status.extras} className="mt-3 w-full" />
              </div>
            )}
            <QuoteForm submitting={status.kind === 'sending'} onSubmit={send} />
            <p className="mt-4 text-center text-sm text-ceniza">
              <Link to="/" className="underline hover:text-humo">
                ← Cambiar mi configuración
              </Link>
            </p>
          </>
        )}
      </div>
      <SummaryPanel />
    </div>
  );
}
