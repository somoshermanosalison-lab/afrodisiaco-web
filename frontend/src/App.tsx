import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { Layout } from './components/layout/Layout';
import { useCatalogStore } from './store/catalogStore';

const ConfiguratorPage = lazy(() => import('./pages/Configurator/ConfiguratorPage'));
const QuotePage = lazy(() => import('./pages/Quote/QuotePage'));
const AdminPage = lazy(() => import('./pages/Admin/AdminPage'));
const NotFoundPage = lazy(() => import('./pages/NotFound/NotFoundPage'));

export function App() {
  const loadCatalog = useCatalogStore((s) => s.load);
  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  return (
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Layout>
          <Suspense fallback={<LoadingScreen label="Cargando…" />}>
            <Routes>
              <Route path="/" element={<ConfiguratorPage />} />
              <Route path="/cotizacion" element={<QuotePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
