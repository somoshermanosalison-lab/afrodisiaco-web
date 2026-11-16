import type {
  Catalog,
  Configuration,
  EquipmentLine,
  Notice,
  ProductionLevel,
  ResolvedSetup,
} from './types';

/**
 * Reglas de negocio del configurador. Todo lo que decide qué equipo lleva un
 * evento, qué se recomienda y qué se advierte vive aquí, no en los componentes.
 */

/** Umbrales configurables de las reglas. */
export const RULES = {
  /** m² por invitado por debajo de los cuales el lugar queda apretado. */
  minAreaPerGuest: 0.6,
  /** A partir de aquí se recomienda Premium o superior. */
  premiumFromGuests: 200,
  /** A partir de aquí se recomienda reforzar el audio. */
  extraSoundFromGuests: 400,
  /** Altura mínima para montar torres de truss con pantallas. */
  minHeightForTruss: 2.6,
} as const;

export function recommendLevel(guests: number, catalog: Catalog): ProductionLevel {
  const sorted = [...catalog.packages].sort((a, b) => a.maxGuests - b.maxGuests);
  const fit = sorted.find((p) => guests <= p.maxGuests);
  return (fit ?? sorted[sorted.length - 1]).id;
}

/** Quita addons desconocidos o inactivos y recorta cantidades al máximo permitido. */
export function sanitizeAddons(addons: Record<string, number>, catalog: Catalog): Record<string, number> {
  const clean: Record<string, number> = {};
  for (const addon of catalog.addons) {
    if (!addon.active) continue;
    const qty = Math.floor(addons[addon.id] ?? 0);
    if (qty >= 1) clean[addon.id] = Math.min(qty, addon.maxQuantity);
  }
  return clean;
}

export function resolveSetup(config: Configuration, catalog: Catalog): ResolvedSetup {
  const { width, length, height } = config.venue;
  const area = round1(width * length);
  const volume = round1(width * length * height);
  const notices: Notice[] = [];
  const recommendedLevel = recommendLevel(config.guests, catalog);
  const pkg = catalog.packages.find((p) => p.id === config.level) ?? null;
  const addons = sanitizeAddons(config.addons, catalog);

  // --- Equipo: paquete + extras ---
  const totals = new Map<string, { fromPackage: number; fromAddons: number }>();
  const bump = (id: string, key: 'fromPackage' | 'fromAddons', qty: number) => {
    const cur = totals.get(id) ?? { fromPackage: 0, fromAddons: 0 };
    cur[key] += qty;
    totals.set(id, cur);
  };
  for (const item of pkg?.equipment ?? []) bump(item.equipmentId, 'fromPackage', item.quantity);
  for (const addon of catalog.addons) {
    const qty = addons[addon.id];
    if (!qty) continue;
    if (addon.replacesEquipmentId) totals.delete(addon.replacesEquipmentId);
    if (addon.equipmentId) bump(addon.equipmentId, 'fromAddons', qty);
  }

  const equipment: EquipmentLine[] = [];
  let inventoryOk = true;
  for (const [id, t] of totals) {
    const item = catalog.equipment.find((e) => e.id === id);
    if (!item) continue;
    const quantity = t.fromPackage + t.fromAddons;
    if (quantity <= 0) continue;
    if (quantity > item.quantityAvailable) {
      inventoryOk = false;
      notices.push({
        code: `inventory:${id}`,
        severity: 'error',
        message: `No contamos actualmente con suficientes unidades para esta configuración (${item.name}: pides ${quantity}, hay ${item.quantityAvailable}).`,
      });
    }
    equipment.push({ equipment: item, quantity, ...t });
  }

  // --- Recomendaciones por invitados ---
  if (pkg && config.guests > pkg.maxGuests) {
    const better = catalog.packages.find((p) => p.id === recommendedLevel);
    notices.push({
      code: 'guests:level',
      severity: 'warning',
      message:
        better && better.id !== pkg.id
          ? `${pkg.name} cubre hasta ${pkg.maxGuests} invitados. Para ${config.guests} te recomendamos ${better.name}.`
          : `${pkg.name} cubre hasta ${pkg.maxGuests} invitados. Para ${config.guests} conviene reforzar el audio.`,
    });
  } else if (!pkg && config.guests > RULES.premiumFromGuests) {
    notices.push({
      code: 'guests:premium',
      severity: 'info',
      message: `Con más de ${RULES.premiumFromGuests} invitados recomendamos Premium o superior.`,
    });
  }
  if (config.guests > RULES.extraSoundFromGuests) {
    notices.push({
      code: 'guests:sound',
      severity: 'warning',
      message: `Con más de ${RULES.extraSoundFromGuests} invitados recomendamos un sistema de sonido superior; lo revisamos contigo en la cotización.`,
    });
  }

  // --- Reglas de espacio ---
  if (area < config.guests * RULES.minAreaPerGuest) {
    notices.push({
      code: 'venue:tight',
      severity: 'warning',
      message: `El espacio (${area} m²) queda justo para ${config.guests} invitados; algunos elementos podrían no ser recomendables.`,
    });
  }
  if (totals.has('truss') && height < RULES.minHeightForTruss) {
    notices.push({
      code: 'venue:truss',
      severity: 'warning',
      message: `Con ${height} m de altura las torres con pantallas quedan muy justas; podemos montarlas en bases bajas.`,
    });
  }
  for (const addon of catalog.addons) {
    if (!addons[addon.id]) continue;
    if (addon.minHeight && height < addon.minHeight) {
      notices.push({
        code: `venue:height:${addon.id}`,
        severity: 'warning',
        message: `${addon.name} necesita al menos ${addon.minHeight} m de altura; tu espacio tiene ${height} m.`,
      });
    }
    if (addon.minArea && area < addon.minArea) {
      notices.push({
        code: `venue:area:${addon.id}`,
        severity: 'warning',
        message: `${addon.name} necesita al menos ${addon.minArea} m²; tu espacio tiene ${area} m².`,
      });
    }
    if (addon.requiresApproval) {
      notices.push({
        code: `approval:${addon.id}`,
        severity: 'info',
        message: `${addon.name}: confirmamos contigo que el lugar lo permite.`,
      });
    }
    for (const dep of addon.dependencies) {
      if (!addons[dep]) {
        const depName = catalog.addons.find((a) => a.id === dep)?.name ?? dep;
        notices.push({
          code: `dependency:${addon.id}:${dep}`,
          severity: 'error',
          message: `${addon.name} requiere agregar también ${depName}.`,
        });
      }
    }
  }

  return { area, volume, recommendedLevel, equipment, notices, inventoryOk };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
