import {
  DEFAULT_GUESTS,
  DEFAULT_VENUE,
  configurationSchema,
  decodeConfiguration,
  type Configuration,
  type EventType,
  type ProductionLevel,
  type VenueDimensions,
} from '@afrodisiaco/shared';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const STEPS = ['event', 'guests', 'venue', 'level', 'addons'] as const;
export type StepId = (typeof STEPS)[number];

const emptyConfiguration = (): Configuration => ({
  eventType: null,
  guests: DEFAULT_GUESTS,
  venue: { ...DEFAULT_VENUE },
  level: null,
  addons: {},
});

interface ConfiguratorState {
  config: Configuration;
  step: number;
  setStep: (step: number) => void;
  setEventType: (eventType: EventType) => void;
  setGuests: (guests: number) => void;
  setVenue: (venue: Partial<VenueDimensions>) => void;
  setLevel: (level: ProductionLevel) => void;
  /** Cantidad 0 quita el extra; nunca se guardan cantidades negativas. */
  setAddonQuantity: (addonId: string, quantity: number) => void;
  loadConfiguration: (config: Configuration) => void;
  reset: () => void;
}

export const useConfiguratorStore = create<ConfiguratorState>()(
  persist(
    (set) => ({
      config: emptyConfiguration(),
      step: 0,
      setStep: (step) => set({ step: Math.min(Math.max(0, step), STEPS.length - 1) }),
      setEventType: (eventType) => set((s) => ({ config: { ...s.config, eventType } })),
      setGuests: (guests) => set((s) => ({ config: { ...s.config, guests } })),
      setVenue: (venue) => set((s) => ({ config: { ...s.config, venue: { ...s.config.venue, ...venue } } })),
      setLevel: (level) => set((s) => ({ config: { ...s.config, level } })),
      setAddonQuantity: (addonId, quantity) =>
        set((s) => {
          const addons = { ...s.config.addons };
          const qty = Math.floor(quantity);
          if (qty >= 1) addons[addonId] = qty;
          else delete addons[addonId];
          return { config: { ...s.config, addons } };
        }),
      loadConfiguration: (config) => set({ config, step: 0 }),
      reset: () => set({ config: emptyConfiguration(), step: 0 }),
    }),
    {
      name: 'afrodisiaco-configurador',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ config: s.config, step: s.step }),
      // Lo guardado en el navegador se valida igual que cualquier dato externo.
      merge: (persisted, current) => {
        const saved = persisted as Partial<ConfiguratorState> | undefined;
        const parsed = configurationSchema.safeParse(saved?.config);
        if (!parsed.success) return current;
        const step = typeof saved?.step === 'number' ? saved.step : 0;
        return { ...current, config: parsed.data, step: Math.min(Math.max(0, step), STEPS.length - 1) };
      },
    },
  ),
);

/** Si la URL trae `?config=`, carga esa configuración (ya validada) y limpia la URL. */
export function loadSharedConfigurationFromUrl(): boolean {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('config');
  if (!code) return false;
  const config = decodeConfiguration(code);
  params.delete('config');
  const query = params.toString();
  window.history.replaceState(null, '', window.location.pathname + (query ? `?${query}` : ''));
  if (!config) return false;
  useConfiguratorStore.getState().loadConfiguration(config);
  return true;
}
