import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { adminToken, fetchAdminCatalog, type AdminCatalog } from '@/services/adminService';
import { ApiError } from '@/services/api';
import { CatalogEditor } from './CatalogEditor';
import { QuotesTable } from './QuotesTable';

type Tab = 'quotes' | 'addons' | 'equipment' | 'packages';
const TABS: { id: Tab; label: string }[] = [
  { id: 'quotes', label: 'Cotizaciones' },
  { id: 'addons', label: 'Extras y precios' },
  { id: 'equipment', label: 'Inventario' },
  { id: 'packages', label: 'Paquetes' },
];

type Session = { state: 'login'; error?: string } | { state: 'loading' } | { state: 'ready'; catalog: AdminCatalog };

/** Mensaje apto para mostrar a partir de un error de la API. */
export function adminErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Token incorrecto o sesión vencida.';
    if (err.status === 503) return 'La base de datos no está conectada.';
    if (err.status === 400) return 'Revisa los valores: hay un dato inválido.';
    if (err.status === 429) return 'Demasiadas solicitudes. Espera un momento.';
  }
  return 'No pudimos completar la operación. Intenta nuevamente.';
}

export default function AdminPage() {
  const [session, setSession] = useState<Session>(adminToken.get() ? { state: 'loading' } : { state: 'login' });
  const [tab, setTab] = useState<Tab>('quotes');

  const load = useCallback(async () => {
    try {
      setSession({ state: 'ready', catalog: await fetchAdminCatalog() });
    } catch (err) {
      console.error('[admin] no se pudo cargar:', err);
      adminToken.clear();
      setSession({ state: 'login', error: adminErrorMessage(err) });
    }
  }, []);

  useEffect(() => {
    // Esta pantalla no debe aparecer en buscadores.
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    if (adminToken.get()) void load();
    return () => meta.remove();
  }, [load]);

  const login = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = String(new FormData(e.currentTarget).get('token') ?? '').trim();
    if (!token) return;
    adminToken.set(token);
    setSession({ state: 'loading' });
    void load();
  };

  if (session.state === 'loading') return <LoadingScreen label="Cargando administración…" />;

  if (session.state === 'login') {
    return (
      <form onSubmit={login} className="mx-auto mt-16 max-w-sm px-4">
        <h1 className="font-display text-3xl font-black">Administración</h1>
        <p className="mt-2 text-sm text-ceniza">Escribe el token de administrador para continuar.</p>
        <label htmlFor="admin-token" className="mb-1.5 mt-6 block text-xs font-semibold uppercase tracking-[0.2em] text-ceniza">
          Token
        </label>
        <input
          id="admin-token"
          name="token"
          type="password"
          autoComplete="off"
          required
          className="min-h-12 w-full rounded-sm border border-line bg-noir-2 px-4 py-3 text-base text-humo"
        />
        {session.error && (
          <p role="alert" className="mt-2 text-sm text-ember">
            {session.error}
          </p>
        )}
        <Button type="submit" variant="gold" className="mt-4 w-full">
          Entrar
        </Button>
      </form>
    );
  }

  const { catalog } = session;
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-black">Administración</h1>
        <Button
          variant="ghost"
          onClick={() => {
            adminToken.clear();
            setSession({ state: 'login' });
          }}
        >
          Cerrar sesión
        </Button>
      </div>

      <div role="tablist" aria-label="Secciones" className="mt-5 flex flex-wrap gap-1.5 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === t.id ? 'border-champan text-champan' : 'border-transparent text-ceniza hover:text-humo'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab !== 'quotes' && !catalog.editable && (
        <p role="status" className="mt-4 rounded-sm border border-champan/50 bg-noir-2 px-4 py-3 text-sm text-champan">
          El catálogo todavía no está en la base de datos, así que aquí solo se puede consultar. Conecta
          PostgreSQL y corre <code>npm run db:seed</code> para poder editarlo.
        </p>
      )}

      <div role="tabpanel" className="mt-5">
        {tab === 'quotes' ? <QuotesTable /> : <CatalogEditor tab={tab} catalog={catalog} onSaved={load} />}
      </div>
    </div>
  );
}
