import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-sm focus:bg-champan focus:px-4 focus:py-2 focus:text-noir">
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-noir/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between px-4 lg:px-6">
          <Link to="/" className="font-display text-xl font-black tracking-tight">
            Afrodísiaco <span className="ml-1 hidden text-xs font-normal uppercase tracking-[0.3em] text-champan sm:inline">Arma tu evento</span>
          </Link>
          {/* El sitio principal vive fuera del configurador, en la raíz del dominio. */}
          <a href="/" className="text-sm text-ceniza transition hover:text-humo">
            ← Volver al sitio
          </a>
        </div>
      </header>
      <main id="contenido" className="flex-1">
        {children}
      </main>
    </div>
  );
}
