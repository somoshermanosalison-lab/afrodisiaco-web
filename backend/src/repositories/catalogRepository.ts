import {
  DEFAULT_CATALOG,
  type Addon,
  type AddonPatch,
  type Catalog,
  type Equipment,
  type EquipmentPatch,
  type PackagePatch,
  type EquipmentCategory,
  type EquipmentQuantity,
  type ProductionLevel,
  type ProductionPackage,
} from '@afrodisiaco/shared';
import { pool, requirePool } from '../db';

const CACHE_MS = 60_000;
let cache: { at: number; catalog: Catalog } | null = null;

interface EquipmentRow {
  id: string;
  name: string;
  category: EquipmentCategory;
  quantity_available: number;
  model_3d: string | null;
  image: string | null;
  description: string;
  hidden_in_scene: boolean;
}
interface PackageRow {
  id: ProductionLevel;
  name: string;
  tagline: string;
  description: string;
  base_price: number;
  hours: number;
  max_guests: number;
  image: string;
  highlights: string[];
  equipment: EquipmentQuantity[];
}
interface AddonRow {
  id: string;
  name: string;
  description: string;
  price: number;
  max_quantity: number;
  equipment_id: string | null;
  replaces_equipment_id: string | null;
  dependencies: string[];
  requires_approval: boolean;
  min_height: string | null;
  min_area: string | null;
  active: boolean;
}

const toEquipment = (r: EquipmentRow): Equipment => ({
  id: r.id,
  name: r.name,
  category: r.category,
  quantityAvailable: r.quantity_available,
  model3D: r.model_3d,
  image: r.image,
  description: r.description,
  hiddenInScene: r.hidden_in_scene,
});

const toPackage = (r: PackageRow): ProductionPackage => ({
  id: r.id,
  name: r.name,
  tagline: r.tagline,
  description: r.description,
  basePrice: r.base_price,
  hours: r.hours,
  maxGuests: r.max_guests,
  image: r.image,
  highlights: r.highlights,
  equipment: r.equipment,
});

const toAddon = (r: AddonRow): Addon => ({
  id: r.id,
  name: r.name,
  description: r.description,
  price: r.price,
  maxQuantity: r.max_quantity,
  equipmentId: r.equipment_id,
  replacesEquipmentId: r.replaces_equipment_id ?? undefined,
  dependencies: r.dependencies,
  requiresApproval: r.requires_approval,
  minHeight: r.min_height === null ? undefined : Number(r.min_height),
  minArea: r.min_area === null ? undefined : Number(r.min_area),
  active: r.active,
});

/**
 * Catálogo vigente: el de la base de datos si existe y tiene datos; si no, el
 * catálogo por defecto de `shared`. Un fallo de la base nunca tumba la API.
 */
export async function getCatalog(): Promise<Catalog> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.catalog;
  let catalog = DEFAULT_CATALOG;
  if (pool) {
    try {
      const [eq, pk, ad] = await Promise.all([
        pool.query<EquipmentRow>('SELECT * FROM equipment ORDER BY sort_order, id'),
        pool.query<PackageRow>('SELECT * FROM packages ORDER BY sort_order, id'),
        pool.query<AddonRow>('SELECT * FROM addons ORDER BY sort_order, id'),
      ]);
      if (eq.rowCount && pk.rowCount) {
        catalog = {
          ...DEFAULT_CATALOG,
          equipment: eq.rows.map(toEquipment),
          packages: pk.rows.map(toPackage),
          addons: ad.rows.map(toAddon),
        };
      }
    } catch (err) {
      console.error('[catalog] no se pudo leer la base; se usa el catálogo por defecto:', (err as Error).message);
    }
  }
  cache = { at: Date.now(), catalog };
  return catalog;
}

export function clearCatalogCache(): void {
  cache = null;
}

/**
 * Actualiza columnas de una fila del catálogo. Las columnas salen de una lista
 * fija en el código (nunca del cliente) y los valores van como parámetros.
 */
async function updateRow(table: 'addons' | 'equipment' | 'packages', id: string, columns: Record<string, unknown>): Promise<boolean> {
  const entries = Object.entries(columns).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return false;
  const sets = entries.map(([col], i) => `${col} = $${i + 2}`).join(', ');
  const res = await requirePool().query(`UPDATE ${table} SET ${sets} WHERE id = $1`, [id, ...entries.map(([, v]) => v)]);
  clearCatalogCache();
  return (res.rowCount ?? 0) > 0;
}

export const updateAddon = (id: string, p: AddonPatch) =>
  updateRow('addons', id, { price: p.price, max_quantity: p.maxQuantity, active: p.active });

export const updateEquipment = (id: string, p: EquipmentPatch) =>
  updateRow('equipment', id, { quantity_available: p.quantityAvailable });

export const updatePackage = (id: string, p: PackagePatch) =>
  updateRow('packages', id, { base_price: p.basePrice, max_guests: p.maxGuests });

/** true si el catálogo vive en la base de datos (y por tanto se puede editar). */
export async function isCatalogEditable(): Promise<boolean> {
  if (!pool) return false;
  try {
    const res = await pool.query('SELECT 1 FROM packages LIMIT 1');
    return (res.rowCount ?? 0) > 0;
  } catch {
    return false;
  }
}
