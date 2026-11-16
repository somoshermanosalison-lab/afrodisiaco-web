import { DEFAULT_CATALOG } from '@afrodisiaco/shared';
import { pool } from '../db';

/**
 * Carga el catálogo por defecto en la base de datos.
 * Inserta lo que falta y NO pisa lo que ya existe, para no borrar precios o
 * inventario que se hayan cambiado después. Usa `--force` para sobrescribir.
 */
async function main() {
  if (!pool) {
    console.error('Falta DATABASE_URL en backend/.env');
    process.exit(1);
  }
  const force = process.argv.includes('--force');
  const conflict = (cols: string[]) =>
    force ? `DO UPDATE SET ${cols.map((c) => `${c} = EXCLUDED.${c}`).join(', ')}` : 'DO NOTHING';
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [i, e] of DEFAULT_CATALOG.equipment.entries()) {
      await client.query(
        `INSERT INTO equipment (id, name, category, quantity_available, model_3d, image, description, hidden_in_scene, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) ${conflict(['name', 'category', 'quantity_available', 'model_3d', 'image', 'description', 'hidden_in_scene', 'sort_order'])}`,
        [e.id, e.name, e.category, e.quantityAvailable, e.model3D, e.image, e.description, e.hiddenInScene ?? false, i],
      );
    }
    for (const [i, p] of DEFAULT_CATALOG.packages.entries()) {
      await client.query(
        `INSERT INTO packages (id, name, tagline, description, base_price, hours, max_guests, image, highlights, equipment, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) ${conflict(['name', 'tagline', 'description', 'base_price', 'hours', 'max_guests', 'image', 'highlights', 'equipment', 'sort_order'])}`,
        [p.id, p.name, p.tagline, p.description, p.basePrice, p.hours, p.maxGuests, p.image, JSON.stringify(p.highlights), JSON.stringify(p.equipment), i],
      );
    }
    for (const [i, a] of DEFAULT_CATALOG.addons.entries()) {
      await client.query(
        `INSERT INTO addons (id, name, description, price, max_quantity, equipment_id, replaces_equipment_id, dependencies, requires_approval, min_height, min_area, active, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) ${conflict(['name', 'description', 'price', 'max_quantity', 'equipment_id', 'replaces_equipment_id', 'dependencies', 'requires_approval', 'min_height', 'min_area', 'active', 'sort_order'])}`,
        [a.id, a.name, a.description, a.price, a.maxQuantity, a.equipmentId, a.replacesEquipmentId ?? null, JSON.stringify(a.dependencies), a.requiresApproval, a.minHeight ?? null, a.minArea ?? null, a.active, i],
      );
    }
    await client.query('COMMIT');
    console.log(`Catálogo sembrado${force ? ' (sobrescribiendo)' : ''}.`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('No se pudo sembrar el catálogo:', (err as Error).message);
  process.exit(1);
});
