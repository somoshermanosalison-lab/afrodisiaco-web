import type { EquipmentLine, VenueDimensions } from '@afrodisiaco/shared';

/**
 * Acomodo del montaje: convierte la lista de equipo en posiciones dentro del salón.
 * Coordenadas en metros, relativas al escenario: x = izquierda/derecha,
 * y = altura, z = distancia desde el muro del fondo hacia el público.
 */

export type SceneItemKind = 'model' | 'led-floor' | 'cold-spark' | 'post' | 'pole' | 'screen-content';

export interface SceneItem {
  key: string;
  kind: SceneItemKind;
  equipmentId: string;
  label: string;
  /** Ruta del .glb; null = todavía no hay modelo y se dibuja un placeholder. */
  modelUrl: string | null;
  position: [number, number, number];
  rotation?: [number, number, number];
  /** Tamaño aproximado (ancho, alto, fondo) para placeholders y piezas procedurales. */
  size: [number, number, number];
  /** true = cabeza móvil: puede proyectar un haz de luz. */
  beam?: boolean;
}

export interface SceneLayout {
  items: SceneItem[];
  /** Lado de la pista iluminada (0 si no hay). */
  floorSize: number;
}

const SUB = { w: 0.62, h: 0.64 };
const SPEAKER_Y = 1.69;
const SCREEN = { w: 1.24, y: 1.72, spacing: 1.45 };
const TRUSS_H = 2.25;
const Z = { wall: 0.35, screens: 1.0, truss: 0.8, bars: 1.3, stacks: 1.5, booth: 1.9, front: 2.6 };

/** Tamaños de placeholder para equipo que todavía no tiene modelo. */
const PLACEHOLDER_SIZE: Record<string, [number, number, number]> = {
  'robot-led': [0.7, 2.3, 0.5],
  'co2-confetti': [0.3, 0.5, 0.3],
  flamethrower: [0.3, 0.4, 0.3],
  laser: [0.3, 0.2, 0.3],
  projector: [2.5, 2.55, 0.1],
};

const spread = (count: number, spacing: number) =>
  Array.from({ length: count }, (_, i) => (i - (count - 1) / 2) * spacing);

export function buildSceneLayout(lines: EquipmentLine[], venue: VenueDimensions): SceneLayout {
  const items: SceneItem[] = [];
  const qty = (id: string) => lines.find((l) => l.equipment.id === id)?.quantity ?? 0;
  const info = (id: string) => lines.find((l) => l.equipment.id === id)?.equipment;
  const handled = new Set<string>();

  const add = (
    id: string,
    index: number | string,
    position: [number, number, number],
    opts: Partial<Pick<SceneItem, 'kind' | 'rotation' | 'size' | 'beam' | 'modelUrl'>> = {},
  ) => {
    const eq = info(id);
    items.push({
      key: `${id}-${index}`,
      kind: opts.kind ?? 'model',
      equipmentId: id,
      label: eq?.name ?? id,
      modelUrl: opts.modelUrl !== undefined ? opts.modelUrl : (eq?.model3D ?? null),
      position,
      rotation: opts.rotation,
      size: opts.size ?? PLACEHOLDER_SIZE[id] ?? [0.5, 0.5, 0.5],
      beam: opts.beam,
    });
    handled.add(id);
  };

  // --- Cabina ---
  const boothId = qty('dj-booth-pixel') > 0 ? 'dj-booth-pixel' : qty('dj-booth') > 0 ? 'dj-booth' : null;
  if (boothId) add(boothId, 0, [0, 0, Z.booth], { size: [2.5, 1.25, 0.7] });
  handled.add('dj-booth').add('dj-booth-pixel');

  // --- Pantallas sobre truss (o poste si no alcanza el truss) ---
  const screens = qty('led-screen');
  const trussCount = qty('truss');
  const screenXs = spread(screens, SCREEN.spacing);
  screenXs.forEach((x, i) => {
    add('led-screen', i, [x, SCREEN.y, Z.screens], { size: [SCREEN.w, 0.7, 0.06] });
    add('led-screen', `content-${i}`, [x, SCREEN.y, Z.screens + 0.035], { kind: 'screen-content', size: [1.2, 0.675, 0] });
    if (i < trussCount) add('truss', i, [x, 0, Z.truss], { size: [0.3, TRUSS_H, 0.3] });
    else add('led-screen', `post-${i}`, [x, 0, Z.screens - 0.1], { kind: 'post', size: [0.06, SCREEN.y, 0.06] });
  });
  // Truss sobrante (más torres que pantallas) a los lados.
  for (let i = screens; i < trussCount; i++) {
    const side = (i - screens) % 2 === 0 ? -1 : 1;
    add('truss', i, [side * (screenXs.length * SCREEN.spacing * 0.5 + 0.8 + Math.floor((i - screens) / 2) * 0.6), 0, Z.truss], { size: [0.3, TRUSS_H, 0.3] });
  }
  handled.add('truss');

  // --- Torres de audio a los lados ---
  const stageHalf = Math.max(1.25, (screens * SCREEN.spacing) / 2) + 0.75;
  const stackX = (side: number, rank: number) => side * (stageHalf + rank * SUB.w);
  const subs = qty('subwoofer');
  const subRanks = [Math.ceil(subs / 2), Math.floor(subs / 2)]; // [izquierda, derecha]
  for (let i = 0; i < subs; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    add('subwoofer', i, [stackX(side, Math.floor(i / 2)), 0, Z.stacks], { size: [0.56, SUB.h, 0.66] });
  }
  handled.add('subwoofer');

  const polePositions: [number, number, number][] = [];
  const speakers = qty('speaker');
  for (let i = 0; i < speakers; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const rank = Math.floor(i / 2);
    const onSub = rank < subRanks[side === -1 ? 0 : 1];
    const x = stackX(side, rank);
    const poleBase = onSub ? SUB.h : 0;
    add('speaker', i, [x, SPEAKER_Y, Z.stacks], { size: [0.44, 0.74, 0.4] });
    add('speaker', `pole-${i}`, [x, poleBase, Z.stacks], { kind: 'pole', size: [0.035, SPEAKER_Y - poleBase, 0.035] });
    polePositions.push([x, 1.2, Z.stacks + 0.14]);
  }
  handled.add('speaker');

  const tripods = qty('speaker-tripod');
  const tripodStart = Math.max(subRanks[0], Math.ceil(speakers / 2));
  for (let i = 0; i < tripods; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    add('speaker-tripod', i, [side * (stageHalf + tripodStart * SUB.w + 0.45 + Math.floor(i / 2) * 1.0), 0, Z.stacks], { size: [0.9, 2.2, 0.9] });
  }
  handled.add('speaker-tripod');

  // --- Wash: primero en los tubos de las bocinas, el resto en el piso contra el muro ---
  const wash = qty('wash');
  const onPoles = Math.min(wash, polePositions.length);
  for (let i = 0; i < onPoles; i++) add('wash', i, polePositions[i], { size: [0.22, 0.22, 0.1] });
  spread(wash - onPoles, Math.min(1.1, (stageHalf * 2) / Math.max(1, wash - onPoles))).forEach((x, i) =>
    add('wash', onPoles + i, [x, 0.13, Z.wall], { rotation: [-0.7, 0, 0], size: [0.22, 0.22, 0.1] }),
  );
  handled.add('wash');

  // --- Cabezas móviles: sobre truss, sobre subwoofers, y el resto en el piso ---
  const headSpots: [number, number, number][] = [];
  screenXs.slice(0, trussCount).forEach((x) => headSpots.push([x, TRUSS_H, Z.truss]));
  for (let i = 0; i < subs; i++) headSpots.push([stackX(i % 2 === 0 ? -1 : 1, Math.floor(i / 2)), SUB.h, Z.stacks + 0.2]);
  let headIndex = 0;
  for (const id of ['beam', 'mini-beam']) {
    for (let i = 0; i < qty(id); i++, headIndex++) {
      const spot = headSpots[headIndex];
      const floorRank = headIndex - headSpots.length;
      const position: [number, number, number] = spot ?? [
        (floorRank % 2 === 0 ? -1 : 1) * (1.55 + Math.floor(floorRank / 2) * 0.55),
        0,
        Z.front - 0.3,
      ];
      add(id, i, position, { size: [0.3, 0.4, 0.3], beam: true });
    }
    handled.add(id);
  }

  // --- Barras de luces detrás de la cabina ---
  spread(qty('light-bar'), 1.2).forEach((x, i) => add('light-bar', i, [x, 0, Z.bars], { size: [1, 2.4, 0.4] }));
  handled.add('light-bar');

  // --- Humo ---
  for (let i = 0; i < qty('smoke-machine'); i++) add('smoke-machine', i, [0.45 * (i % 2 === 0 ? 1 : -1) * (1 + Math.floor(i / 2)), 0, Z.front], { size: [0.22, 0.14, 0.3] });
  for (let i = 0; i < qty('low-fog'); i++) add('low-fog', i, [-0.9 - i * 0.5, 0, Z.front], { size: [0.22, 0.14, 0.3] });
  handled.add('smoke-machine').add('low-fog');

  // --- Pista iluminada, al centro frente al escenario ---
  let floorSize = 0;
  if (qty('led-floor') > 0) {
    floorSize = Math.max(2, Math.min(6, venue.width - 2, venue.length - Z.front - 2));
    add('led-floor', 0, [0, 0, Z.front + 0.7 + floorSize / 2], { kind: 'led-floor', size: [floorSize, 0.08, floorSize] });
  }
  handled.add('led-floor');

  // --- Chisperos: puntos de instalación en línea frente al escenario ---
  const sparks = qty('cold-spark');
  const sparkSpan = Math.max(stageHalf * 2, floorSize);
  spread(sparks, sparks > 1 ? sparkSpan / (sparks - 1) : 0).forEach((x, i) =>
    add('cold-spark', i, [x, 0, Z.front + 0.35], { kind: 'cold-spark', size: [0.22, 0.25, 0.22] }),
  );
  handled.add('cold-spark');

  // --- Equipo con posición propia pero sin modelo todavía ---
  for (let i = 0; i < qty('robot-led'); i++) add('robot-led', i, [(i % 2 === 0 ? -1 : 1) * 1.3, 0, Z.front + 1.6]);
  for (let i = 0; i < qty('co2-confetti'); i++) add('co2-confetti', i, [(i % 2 === 0 ? -1 : 1) * (stageHalf - 0.35), 0, Z.front]);
  for (let i = 0; i < qty('flamethrower'); i++) add('flamethrower', i, [(i % 2 === 0 ? -1 : 1) * (stageHalf + 0.2), 0, Z.front + 0.5]);
  // El láser va sobre la mesa de la cabina; el proyector, a un costado contra el muro.
  for (let i = 0; i < qty('laser'); i++) add('laser', i, [0.7 - i * 1.4, 0.94, Z.booth - 0.45]);
  for (let i = 0; i < qty('projector'); i++) add('projector', i, [-(stageHalf + 2.2), 0, Z.wall + 0.1]);

  // --- Cualquier otro equipo visible del catálogo: una fila genérica al frente ---
  const others = lines.filter((l) => !handled.has(l.equipment.id) && !l.equipment.hiddenInScene && !items.some((it) => it.equipmentId === l.equipment.id));
  let slot = 0;
  for (const line of others) {
    for (let i = 0; i < line.quantity; i++, slot++) {
      add(line.equipment.id, i, [(slot % 2 === 0 ? -1 : 1) * (stageHalf + 1 + Math.floor(slot / 2) * 0.8), 0, Z.front + 1]);
    }
  }

  // --- Mantener todo dentro del salón ---
  const limit = Math.max(1, venue.width / 2 - 0.5);
  const reach = Math.max(...items.map((it) => Math.abs(it.position[0]) + it.size[0] / 2), 0);
  if (reach > limit) {
    const k = limit / reach;
    for (const it of items) it.position = [it.position[0] * k, it.position[1], it.position[2]];
  }
  const maxZ = Math.max(1, venue.length - 0.6);
  for (const it of items) {
    if (it.position[2] + it.size[2] / 2 > maxZ) it.position = [it.position[0], it.position[1], Math.max(Z.wall, maxZ - it.size[2] / 2)];
  }

  return { items, floorSize };
}
