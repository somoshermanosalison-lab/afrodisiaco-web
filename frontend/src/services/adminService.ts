import {
  QUOTE_STATUSES,
  type Addon,
  type AddonPatch,
  type Equipment,
  type EquipmentPatch,
  type PackagePatch,
  type ProductionPackage,
  type QuoteStatus,
} from '@afrodisiaco/shared';
import { z } from 'zod';
import { apiRequest } from './api';

const TOKEN_KEY = 'afrodisiaco-admin-token';

/** El token vive solo en la pestaña (sessionStorage): se borra al cerrarla. */
export const adminToken = {
  get: () => sessionStorage.getItem(TOKEN_KEY) ?? '',
  set: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};

const quoteSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  phone: z.string(),
  email: z.string(),
  city: z.string(),
  comments: z.string(),
  eventType: z.string(),
  eventDate: z.string(),
  guests: z.number(),
  venueWidth: z.number(),
  venueLength: z.number(),
  productionLevel: z.string(),
  selectedAddons: z.record(z.string(), z.number()),
  estimatedPrice: z.number(),
  status: z.enum(QUOTE_STATUSES),
  createdAt: z.string(),
});
export type AdminQuote = z.infer<typeof quoteSchema>;

export interface AdminCatalog {
  editable: boolean;
  equipment: Equipment[];
  packages: ProductionPackage[];
  addons: Addon[];
}

const request = (path: string, init?: RequestInit) =>
  apiRequest(`/admin${path}`, { ...init, headers: { Authorization: `Bearer ${adminToken.get()}` } });

const patch = (path: string, body: unknown) => request(path, { method: 'PATCH', body: JSON.stringify(body) });

export async function fetchAdminCatalog(): Promise<AdminCatalog> {
  // Viene de nuestra propia API autenticada; se usa tal cual con sus tipos.
  return (await request('/catalog')) as AdminCatalog;
}

export async function fetchQuotes(status?: QuoteStatus): Promise<AdminQuote[]> {
  return z.array(quoteSchema).parse(await request(`/quotes?limit=200${status ? `&status=${status}` : ''}`));
}

export const setQuoteStatus = (id: string, status: QuoteStatus) => patch(`/quotes/${id}/status`, { status });
export const patchAddon = (id: string, body: AddonPatch) => patch(`/addons/${id}`, body);
export const patchEquipment = (id: string, body: EquipmentPatch) => patch(`/equipment/${id}`, body);
export const patchPackage = (id: string, body: PackagePatch) => patch(`/packages/${id}`, body);
