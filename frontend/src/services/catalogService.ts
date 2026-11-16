import {
  EQUIPMENT_CATEGORIES,
  PRODUCTION_LEVEL_IDS,
  type Addon,
  type Equipment,
  type ProductionPackage,
} from '@afrodisiaco/shared';
import { z } from 'zod';
import { apiRequest } from './api';

// Lo que responde la API también se valida antes de usarse.
const equipmentSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    category: z.enum(EQUIPMENT_CATEGORIES),
    quantityAvailable: z.number().int().min(0),
    model3D: z.string().nullable(),
    image: z.string().nullable(),
    description: z.string(),
    hiddenInScene: z.boolean().optional(),
  }),
);

const packagesSchema = z.array(
  z.object({
    id: z.enum(PRODUCTION_LEVEL_IDS),
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    basePrice: z.number().min(0),
    hours: z.number().positive(),
    maxGuests: z.number().positive(),
    image: z.string(),
    highlights: z.array(z.string()),
    equipment: z.array(z.object({ equipmentId: z.string(), quantity: z.number().int().min(1) })),
  }),
);

const addonsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number().min(0),
    maxQuantity: z.number().int().min(1),
    equipmentId: z.string().nullable(),
    replacesEquipmentId: z.string().optional(),
    dependencies: z.array(z.string()),
    requiresApproval: z.boolean(),
    minHeight: z.number().optional(),
    minArea: z.number().optional(),
    active: z.boolean(),
  }),
);

export interface RemoteCatalog {
  equipment: Equipment[];
  packages: ProductionPackage[];
  addons: Addon[];
}

export async function fetchCatalog(): Promise<RemoteCatalog> {
  const [equipment, packages, addons] = await Promise.all([
    apiRequest('/equipment'),
    apiRequest('/packages'),
    apiRequest('/addons'),
  ]);
  return {
    equipment: equipmentSchema.parse(equipment),
    packages: packagesSchema.parse(packages),
    addons: addonsSchema.parse(addons),
  };
}
