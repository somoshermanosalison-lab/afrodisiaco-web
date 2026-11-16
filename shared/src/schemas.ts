import { z } from 'zod';
import { EVENT_TYPE_IDS, PRODUCTION_LEVEL_IDS, QUOTE_STATUSES } from './types';

export const LIMITS = {
  guests: { min: 10, max: 2000 },
  width: { min: 3, max: 100 },
  length: { min: 3, max: 100 },
  height: { min: 2, max: 15 },
  addonQuantity: { min: 1, max: 20 },
  addonKinds: 30,
} as const;

export const DEFAULT_VENUE = { width: 10, length: 20, height: 4 } as const;
export const DEFAULT_GUESTS = 100;

const numberInRange = (min: number, max: number, label: string) =>
  z
    .number({ message: `${label} debe ser un número` })
    .finite()
    .min(min, `${label}: mínimo ${min}`)
    .max(max, `${label}: máximo ${max}`);

export const venueSchema = z.object({
  width: numberInRange(LIMITS.width.min, LIMITS.width.max, 'Ancho'),
  length: numberInRange(LIMITS.length.min, LIMITS.length.max, 'Largo'),
  height: numberInRange(LIMITS.height.min, LIMITS.height.max, 'Altura'),
});

export const guestsSchema = numberInRange(LIMITS.guests.min, LIMITS.guests.max, 'Invitados').int(
  'Invitados debe ser un número entero',
);

const addonsSchema = z
  .record(
    z.string().regex(/^[a-z0-9-]{1,40}$/),
    z.number().int().min(LIMITS.addonQuantity.min).max(LIMITS.addonQuantity.max),
  )
  .refine((v) => Object.keys(v).length <= LIMITS.addonKinds, 'Demasiados extras');

/** Configuración en cualquier punto del flujo (pasos sin completar = null). */
export const configurationSchema = z.object({
  eventType: z.enum(EVENT_TYPE_IDS).nullable(),
  guests: guestsSchema,
  venue: venueSchema,
  level: z.enum(PRODUCTION_LEVEL_IDS).nullable(),
  addons: addonsSchema,
});

/** Configuración terminada: lista para cotizar. */
export const completeConfigurationSchema = configurationSchema.extend({
  eventType: z.enum(EVENT_TYPE_IDS),
  level: z.enum(PRODUCTION_LEVEL_IDS),
});
export type CompleteConfiguration = z.infer<typeof completeConfigurationSchema>;

const text = (max: number) => z.string().trim().max(max);

const todayIso = () => new Date().toISOString().slice(0, 10);

export const customerSchema = z.object({
  customerName: text(80).min(3, 'Escribe tu nombre completo'),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s()+-]/g, ''))
    .pipe(z.string().regex(/^(52)?\d{10}$/, 'Escribe un WhatsApp de 10 dígitos')),
  email: z.email('Escribe un correo válido').max(120),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Elige la fecha del evento')
    .refine((d) => !Number.isNaN(Date.parse(d)), 'Fecha inválida')
    .refine((d) => d >= todayIso(), 'La fecha no puede ser pasada'),
  city: text(60).min(2, 'Escribe la ciudad'),
  comments: text(600).optional().default(''),
});
export type CustomerData = z.infer<typeof customerSchema>;
export type CustomerInput = z.input<typeof customerSchema>;

export const quoteRequestSchema = z.object({
  customer: customerSchema,
  configuration: completeConfigurationSchema,
});
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;

export const contactSchema = z.object({
  name: text(80).min(3, 'Escribe tu nombre'),
  phone: customerSchema.shape.phone,
  message: text(600).min(5, 'Cuéntanos un poco más'),
});
export type ContactRequest = z.infer<typeof contactSchema>;

export const quoteStatusSchema = z.object({ status: z.enum(QUOTE_STATUSES) });

// --- Edición del catálogo desde /admin ---
const atLeastOne = (v: Record<string, unknown>) => Object.keys(v).length > 0;
const price = z.number().int().min(0).max(1_000_000);

export const addonPatchSchema = z
  .object({ price, maxQuantity: z.number().int().min(1).max(LIMITS.addonQuantity.max), active: z.boolean() })
  .partial()
  .refine(atLeastOne, 'Nada que cambiar');
export type AddonPatch = z.infer<typeof addonPatchSchema>;

export const equipmentPatchSchema = z.object({ quantityAvailable: z.number().int().min(0).max(1000) });
export type EquipmentPatch = z.infer<typeof equipmentPatchSchema>;

export const packagePatchSchema = z
  .object({ basePrice: price, maxGuests: z.number().int().min(LIMITS.guests.min).max(LIMITS.guests.max) })
  .partial()
  .refine(atLeastOne, 'Nada que cambiar');
export type PackagePatch = z.infer<typeof packagePatchSchema>;

export const catalogIdSchema = z.string().regex(/^[a-z0-9-]{1,40}$/);
