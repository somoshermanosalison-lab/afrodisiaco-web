import { DEFAULT_CATALOG, type Catalog } from '@afrodisiaco/shared';
import { create } from 'zustand';
import { fetchCatalog } from '@/services/catalogService';

interface CatalogState {
  catalog: Catalog;
  /** 'fallback' = la API no respondió y se muestra el catálogo incluido en la app. */
  status: 'idle' | 'loading' | 'ready' | 'fallback';
  load: () => Promise<void>;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  catalog: DEFAULT_CATALOG,
  status: 'idle',
  load: async () => {
    if (get().status === 'loading') return;
    set({ status: 'loading' });
    try {
      const remote = await fetchCatalog();
      set({ catalog: { ...DEFAULT_CATALOG, ...remote }, status: 'ready' });
    } catch (err) {
      console.error('[catalog] no se pudo actualizar desde la API:', err);
      set({ status: 'fallback' });
    }
  },
}));
