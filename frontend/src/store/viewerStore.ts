import { create } from 'zustand';

/** 'stage' es la vista inicial (y la de "Reset cámara"): el montaje de cerca. */
export type CameraView = 'stage' | 'front' | 'top' | 'full';

interface ViewerState {
  view: CameraView;
  /** Cambia cada vez que se pide una vista, aunque sea la misma, para re-encuadrar. */
  nonce: number;
  /** Modelos que no pudieron cargarse (se muestran como placeholder). */
  failedModels: string[];
  setView: (view: CameraView) => void;
  reportModelError: (url: string) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  view: 'stage',
  nonce: 0,
  failedModels: [],
  setView: (view) => set((s) => ({ view, nonce: s.nonce + 1 })),
  reportModelError: (url) =>
    set((s) => (s.failedModels.includes(url) ? s : { failedModels: [...s.failedModels, url] })),
}));
