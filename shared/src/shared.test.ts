import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CATALOG,
  buildWhatsAppMessage,
  calculatePrice,
  configurationSchema,
  customerSchema,
  decodeConfiguration,
  encodeConfiguration,
  recommendLevel,
  resolveSetup,
  type Configuration,
} from './index';

const base: Configuration = {
  eventType: 'xv',
  guests: 150,
  venue: { width: 10, length: 20, height: 4 },
  level: 'premium',
  addons: {},
};

describe('pricing', () => {
  it('usa el precio base del paquete', () => {
    expect(calculatePrice(base, DEFAULT_CATALOG).total).toBe(14000);
  });

  it('suma extras por cantidad', () => {
    const spark = DEFAULT_CATALOG.addons.find((a) => a.id === 'cold-spark')!;
    const price = calculatePrice({ ...base, addons: { 'cold-spark': 3 } }, DEFAULT_CATALOG);
    expect(price.total).toBe(14000 + spark.price * 3);
  });

  it('ignora extras inexistentes y recorta al máximo', () => {
    const spark = DEFAULT_CATALOG.addons.find((a) => a.id === 'cold-spark')!;
    const price = calculatePrice({ ...base, addons: { nope: 5, 'cold-spark': 99 } }, DEFAULT_CATALOG);
    expect(price.total).toBe(14000 + spark.price * spark.maxQuantity);
  });

  it('sin paquete el total es solo de extras', () => {
    expect(calculatePrice({ ...base, level: null }, DEFAULT_CATALOG).total).toBe(0);
  });
});

describe('rules', () => {
  it('recomienda nivel por invitados', () => {
    expect(recommendLevel(50, DEFAULT_CATALOG)).toBe('essential');
    expect(recommendLevel(150, DEFAULT_CATALOG)).toBe('premium');
    expect(recommendLevel(600, DEFAULT_CATALOG)).toBe('experience');
  });

  it('calcula área y volumen', () => {
    const setup = resolveSetup(base, DEFAULT_CATALOG);
    expect(setup.area).toBe(200);
    expect(setup.volume).toBe(800);
  });

  it('agrega el equipo de los extras', () => {
    const setup = resolveSetup({ ...base, addons: { 'led-floor': 1 } }, DEFAULT_CATALOG);
    expect(setup.equipment.some((l) => l.equipment.id === 'led-floor')).toBe(true);
  });

  it('la cabina pixel sustituye a la cabina blanca', () => {
    const ids = resolveSetup({ ...base, addons: { 'pixel-booth': 1 } }, DEFAULT_CATALOG).equipment.map(
      (l) => l.equipment.id,
    );
    expect(ids).toContain('dj-booth-pixel');
    expect(ids).not.toContain('dj-booth');
  });

  it('avisa cuando se supera el inventario sin romper', () => {
    const setup = resolveSetup({ ...base, level: 'experience', addons: { 'moving-head': 8 } }, DEFAULT_CATALOG);
    expect(setup.inventoryOk).toBe(false);
    expect(setup.notices.some((n) => n.code === 'inventory:beam')).toBe(true);
  });

  it('avisa si el paquete no cubre a los invitados', () => {
    const setup = resolveSetup({ ...base, level: 'essential', guests: 300 }, DEFAULT_CATALOG);
    expect(setup.notices.some((n) => n.code === 'guests:level')).toBe(true);
  });

  it('avisa si el espacio es pequeño o bajo', () => {
    const setup = resolveSetup(
      { ...base, venue: { width: 5, length: 6, height: 2.4 }, addons: { 'cold-spark': 1, 'led-floor': 1 } },
      DEFAULT_CATALOG,
    );
    const codes = setup.notices.map((n) => n.code);
    expect(codes).toContain('venue:tight');
    expect(codes).toContain('venue:height:cold-spark');
    expect(codes).toContain('venue:area:led-floor');
  });
});

describe('validación', () => {
  it('rechaza invitados fuera de rango, negativos o texto', () => {
    for (const guests of [9, 2001, -5, 10.5, Number.NaN, 'abc']) {
      expect(configurationSchema.safeParse({ ...base, guests }).success).toBe(false);
    }
  });

  it('rechaza dimensiones negativas', () => {
    expect(configurationSchema.safeParse({ ...base, venue: { width: -1, length: 20, height: 4 } }).success).toBe(false);
  });

  it('rechaza cantidades de extra en cero', () => {
    expect(configurationSchema.safeParse({ ...base, addons: { 'cold-spark': 0 } }).success).toBe(false);
  });

  it('rechaza fechas pasadas y teléfonos inválidos', () => {
    const ok = { customerName: 'Ana Pérez', phone: '449 805 2216', email: 'ana@example.com', eventDate: '2999-01-01', city: 'Aguascalientes' };
    expect(customerSchema.safeParse(ok).success).toBe(true);
    expect(customerSchema.safeParse({ ...ok, eventDate: '2020-01-01' }).success).toBe(false);
    expect(customerSchema.safeParse({ ...ok, phone: '123' }).success).toBe(false);
  });
});

describe('url compartible', () => {
  it('recupera exactamente la misma configuración', () => {
    const config = { ...base, addons: { 'led-floor': 1, 'cold-spark': 4 } };
    expect(decodeConfiguration(encodeConfiguration(config))).toEqual(config);
  });

  it('descarta datos manipulados', () => {
    expect(decodeConfiguration('no-es-valido')).toBeNull();
    expect(decodeConfiguration(encodeConfiguration({ ...base, guests: 999999 }))).toBeNull();
    expect(decodeConfiguration('<script>')).toBeNull();
  });
});

describe('whatsapp', () => {
  it('incluye los datos de la configuración', () => {
    const config = { ...base, addons: { 'robot-led': 1 } };
    const msg = buildWhatsAppMessage(config, DEFAULT_CATALOG, calculatePrice(config, DEFAULT_CATALOG), {
      eventDate: '2027-08-15',
    });
    expect(msg).toContain('Evento: XV años');
    expect(msg).toContain('Fecha: 15/08/2027');
    expect(msg).toContain('Invitados: 150');
    expect(msg).toContain('Producción: Premium Vibes');
    expect(msg).toContain('- Robot LED');
  });
});
