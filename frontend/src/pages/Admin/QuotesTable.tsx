import { QUOTE_STATUSES, formatMXN, type QuoteStatus } from '@afrodisiaco/shared';
import { useCallback, useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { fetchQuotes, setQuoteStatus, type AdminQuote } from '@/services/adminService';
import { useCatalogStore } from '@/store/catalogStore';
import { adminErrorMessage } from './AdminPage';

const STATUS_LABELS: Record<QuoteStatus, string> = {
  pending: 'Pendiente',
  contacted: 'Contactado',
  quoted: 'Cotizado',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
};

const formatDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

export function QuotesTable() {
  const catalog = useCatalogStore((s) => s.catalog);
  const [filter, setFilter] = useState<QuoteStatus | ''>('');
  const [quotes, setQuotes] = useState<AdminQuote[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setQuotes(await fetchQuotes(filter || undefined));
    } catch (err) {
      console.error('[admin] cotizaciones:', err);
      setQuotes([]);
      setError(adminErrorMessage(err));
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeStatus = async (id: string, status: QuoteStatus) => {
    try {
      await setQuoteStatus(id, status);
      setQuotes((prev) => prev?.map((q) => (q.id === id ? { ...q, status } : q)) ?? null);
    } catch (err) {
      console.error('[admin] estado:', err);
      setError(adminErrorMessage(err));
    }
  };

  const eventName = (id: string) => catalog.eventTypes.find((e) => e.id === id)?.name ?? id;
  const levelName = (id: string) => catalog.packages.find((p) => p.id === id)?.name ?? id;
  const addonNames = (addons: Record<string, number>) =>
    Object.entries(addons)
      .map(([id, qty]) => `${catalog.addons.find((a) => a.id === id)?.name ?? id}${qty > 1 ? ` × ${qty}` : ''}`)
      .join(', ');

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label htmlFor="quote-filter" className="text-sm text-ceniza">
          Estado
        </label>
        <select
          id="quote-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as QuoteStatus | '')}
          className="min-h-11 rounded-sm border border-line bg-noir-2 px-3 text-sm"
        >
          <option value="">Todas</option>
          {QUOTE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => void load()} className="text-sm text-ceniza underline hover:text-humo">
          Actualizar
        </button>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-sm border border-ember/60 bg-noir-2 px-4 py-3 text-sm">
          {error}
        </p>
      )}

      {quotes === null ? (
        <LoadingScreen compact label="Cargando cotizaciones…" />
      ) : quotes.length === 0 ? (
        !error && <p className="rounded-sm border border-line bg-noir-2 px-4 py-8 text-center text-ceniza">No hay cotizaciones{filter ? ' con ese estado' : ' todavía'}.</p>
      ) : (
        <ul className="space-y-3">
          {quotes.map((q) => (
            <li key={q.id} className="rounded-md border border-line bg-noir-2 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold">{q.customerName}</p>
                  <p className="text-sm text-ceniza">
                    <a href={`https://wa.me/${q.phone.length === 10 ? `52${q.phone}` : q.phone}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-humo">
                      {q.phone}
                    </a>{' '}
                    ·{' '}
                    <a href={`mailto:${q.email}`} className="underline hover:text-humo">
                      {q.email}
                    </a>{' '}
                    · {q.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-black text-champan tabular-nums">{formatMXN(q.estimatedPrice)}</p>
                  <label className="sr-only" htmlFor={`status-${q.id}`}>
                    Estado de la cotización de {q.customerName}
                  </label>
                  <select
                    id={`status-${q.id}`}
                    value={q.status}
                    onChange={(e) => void changeStatus(q.id, e.target.value as QuoteStatus)}
                    className="mt-1 min-h-10 rounded-sm border border-line bg-noir px-2 text-sm"
                  >
                    {QUOTE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="mt-3 text-sm">
                <b className="font-semibold">{eventName(q.eventType)}</b> el {formatDate(q.eventDate)} · {q.guests} invitados · {q.venueWidth} × {q.venueLength} m ·{' '}
                {levelName(q.productionLevel)}
              </p>
              {Object.keys(q.selectedAddons).length > 0 && <p className="mt-1 text-sm text-ceniza">Extras: {addonNames(q.selectedAddons)}</p>}
              {q.comments && <p className="mt-1 text-sm text-ceniza">“{q.comments}”</p>}
              <p className="mt-2 text-xs text-ceniza">Recibida el {formatDate(q.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
