import type { Addon, Catalog, Equipment, EventTypeInfo, PricingConfig, ProductionPackage } from './types';

/**
 * Catálogo por defecto de Afrodisíaco.
 *
 * Es la ÚNICA fuente de precios, paquetes, extras e inventario. El backend lo usa
 * para sembrar la base de datos (`npm run db:seed`) y como respaldo cuando no hay
 * base de datos; el frontend lo usa mientras carga la API.
 *
 * ⚠ Los valores marcados con PROVISIONAL no salen del sitio de Afrodisíaco: son
 * cifras de arranque para que el configurador funcione. Cámbialos aquí (o desde la
 * base de datos) antes de publicar.
 */

export const CONTACT = {
  /** Código de país + LADA + número, sin espacios. */
  whatsapp: '524498052216',
  email: 'somoshermanosalison@gmail.com',
  city: 'Aguascalientes',
} as const;

export const DEFAULT_EVENT_TYPES: EventTypeInfo[] = [
  {
    id: 'xv',
    name: 'XV años',
    description: 'Show de luces y color para que la festejada sea la estrella.',
    lighting: { primary: '#ff3ea5', secondary: '#7a5cff', dynamic: true },
    complexity: 1,
  },
  {
    id: 'wedding',
    name: 'Boda',
    description: 'Iluminación elegante y sobria en tonos cálidos.',
    lighting: { primary: '#f5e6c8', secondary: '#c6a15b', dynamic: false },
    complexity: 1,
  },
  {
    id: 'birthday',
    name: 'Cumpleaños',
    description: 'Ambiente festivo con color y movimiento.',
    lighting: { primary: '#ffb020', secondary: '#ff3e6c', dynamic: true },
    complexity: 1,
  },
  {
    id: 'private',
    name: 'Fiesta privada',
    description: 'Producción de club: beams y cabezas móviles.',
    lighting: { primary: '#00e5c8', secondary: '#c4324c', dynamic: true },
    complexity: 1,
  },
  {
    id: 'corporate',
    name: 'Evento corporativo',
    description: 'Imagen limpia, audio claro y pantallas para tu marca.',
    lighting: { primary: '#4da3ff', secondary: '#ffffff', dynamic: false },
    complexity: 1,
  },
  {
    id: 'graduation',
    name: 'Graduación',
    description: 'Energía de concierto para celebrar en grande.',
    lighting: { primary: '#7a5cff', secondary: '#00e5c8', dynamic: true },
    complexity: 1,
  },
  {
    id: 'other',
    name: 'Otro',
    description: 'Cuéntanos tu idea y la armamos a tu medida.',
    lighting: { primary: '#c4324c', secondary: '#c6a15b', dynamic: true },
    complexity: 1,
  },
];

/** PROVISIONAL: las cantidades disponibles son de arranque, no un inventario real. */
export const DEFAULT_EQUIPMENT: Equipment[] = [
  { id: 'speaker', name: 'Medio activo en torre', category: 'sound', quantityAvailable: 6, model3D: '/models/speaker.glb', image: null, description: 'Bocina activa montada en tubo sobre subwoofer.' },
  { id: 'speaker-tripod', name: 'Medio activo en tripié', category: 'sound', quantityAvailable: 4, model3D: '/models/speaker-tripod.glb', image: null, description: 'Bocina activa en tripié.' },
  { id: 'subwoofer', name: 'Subwoofer', category: 'sound', quantityAvailable: 6, model3D: '/models/subwoofer.glb', image: null, description: 'Bajos profundos para la pista.' },
  { id: 'wired-mic', name: 'Micrófono alámbrico', category: 'sound', quantityAvailable: 4, model3D: null, image: null, description: 'Micrófono de mano con cable.', hiddenInScene: true },
  { id: 'wireless-mic', name: 'Micrófono inalámbrico', category: 'sound', quantityAvailable: 4, model3D: null, image: null, description: 'Micrófono de mano inalámbrico.', hiddenInScene: true },
  { id: 'wash', name: 'Luz Wash LED', category: 'lighting', quantityAvailable: 12, model3D: '/models/wash.glb', image: null, description: 'Baño de color sobre pista y muros.' },
  { id: 'mini-beam', name: 'Mini Beam', category: 'lighting', quantityAvailable: 4, model3D: '/models/moving-head.glb', image: null, description: 'Cabeza móvil compacta de haz cerrado.' },
  { id: 'beam', name: 'Cabeza Beam 7R', category: 'lighting', quantityAvailable: 12, model3D: '/models/moving-head.glb', image: null, description: 'Cabeza móvil de haz potente.' },
  { id: 'light-bar', name: 'Barra de luces', category: 'lighting', quantityAvailable: 4, model3D: '/models/light-bar.glb', image: null, description: 'Barra en T con pares LED.' },
  { id: 'laser', name: 'Láser', category: 'lighting', quantityAvailable: 2, model3D: '/models/laser.glb', image: null, description: 'Láser de efectos sobre la pista.' },
  { id: 'led-screen', name: 'Pantalla', category: 'led', quantityAvailable: 6, model3D: '/models/led-screen.glb', image: null, description: 'Pantalla para video, fotos o tu logo.' },
  { id: 'led-floor', name: 'Pista iluminada', category: 'led', quantityAvailable: 1, model3D: null, image: null, description: 'Pista de baile iluminada.' },
  { id: 'projector', name: 'Proyector con pantalla', category: 'led', quantityAvailable: 1, model3D: '/models/projector.glb', image: null, description: 'Proyección para video o presentaciones.' },
  { id: 'smoke-machine', name: 'Máquina de humo', category: 'effects', quantityAvailable: 3, model3D: '/models/smoke-machine.glb', image: null, description: 'Humo para marcar los haces de luz.' },
  { id: 'low-fog', name: 'Máquina de humo bajo', category: 'effects', quantityAvailable: 1, model3D: '/models/smoke-machine.glb', image: null, description: 'Alfombra de humo para el primer baile.' },
  { id: 'cold-spark', name: 'Chispero en frío', category: 'effects', quantityAvailable: 8, model3D: '/models/cold-spark.glb', image: null, description: 'Chispas frías para entradas y momentos clímax.' },
  { id: 'co2-confetti', name: 'Confetti con CO₂', category: 'effects', quantityAvailable: 2, model3D: '/models/co2-confetti.glb', image: null, description: 'Cañón de CO₂ que dispara confetti.' },
  { id: 'flamethrower', name: 'Lanzallamas', category: 'effects', quantityAvailable: 2, model3D: '/models/flamethrower.glb', image: null, description: 'Columnas de fuego sincronizadas con la música.' },
  { id: 'robot-led', name: 'Robot LED', category: 'effects', quantityAvailable: 2, model3D: '/models/robot.glb', image: '/img/robot-led-500.webp', description: 'Robot LED en pista (40 min).' },
  { id: 'dj-booth', name: 'Cabina de DJ', category: 'dj', quantityAvailable: 2, model3D: '/models/dj-booth.glb', image: null, description: 'Cabina blanca iluminada.' },
  { id: 'dj-booth-pixel', name: 'Cabina pixel LED', category: 'dj', quantityAvailable: 1, model3D: '/models/dj-booth-pixel.glb', image: null, description: 'Cabina con paneles de pixel LED.' },
  { id: 'dj', name: 'DJ profesional', category: 'dj', quantityAvailable: 3, model3D: null, image: null, description: 'DJ durante todo el evento.', hiddenInScene: true },
  { id: 'light-operator', name: 'Operador de luces', category: 'dj', quantityAvailable: 2, model3D: null, image: null, description: 'Operación de iluminación en vivo.', hiddenInScene: true },
  { id: 'botarga', name: 'Botarga (cabezón)', category: 'effects', quantityAvailable: 6, model3D: null, image: null, description: 'Personajes en pista.', hiddenInScene: true },
  { id: 'truss', name: 'Torre de truss', category: 'staging', quantityAvailable: 6, model3D: '/models/truss.glb', image: null, description: 'Estructura de aluminio para pantallas y luces.' },
];

/** Nombres, precios base y contenido tomados de la sección "Paquetes" del sitio. */
export const DEFAULT_PACKAGES: ProductionPackage[] = [
  {
    id: 'essential',
    name: 'Esencial Party',
    tagline: 'Lo esencial, bien hecho.',
    description: 'Reuniones y cumpleaños de hasta 80 personas.',
    basePrice: 5500,
    hours: 5,
    maxGuests: 80,
    image: '/img/paquete-esencial-800.webp',
    highlights: [
      '2 medios activos + subwoofer',
      '2 luces Wash LED + 2 mini Beam',
      'Máquina de humo + 2 chisperos en frío',
      'DJ profesional',
      '2 pantallas de 45"',
      '1 micrófono alámbrico',
    ],
    equipment: [
      { equipmentId: 'speaker-tripod', quantity: 2 },
      { equipmentId: 'subwoofer', quantity: 1 },
      { equipmentId: 'wash', quantity: 2 },
      { equipmentId: 'mini-beam', quantity: 2 },
      { equipmentId: 'smoke-machine', quantity: 1 },
      { equipmentId: 'cold-spark', quantity: 2 },
      { equipmentId: 'led-screen', quantity: 2 },
      { equipmentId: 'dj-booth', quantity: 1 },
      { equipmentId: 'dj', quantity: 1 },
      { equipmentId: 'wired-mic', quantity: 1 },
    ],
  },
  {
    id: 'premium',
    name: 'Premium Vibes',
    tagline: 'Aquí empieza la experiencia.',
    description: 'Bodas, XV y fiestas de 100 a 200 personas.',
    basePrice: 14000,
    hours: 5,
    maxGuests: 200,
    image: '/img/paquete-premium-800.webp',
    highlights: [
      '2 medios activos + 2 subwoofer',
      '4 luces Wash LED + 4 cabezas Beam 7R',
      'Máquina de humo + 4 chisperos en frío',
      'DJ + operador de luces en vivo',
      '2 botargas en pista',
      '2 pantallas de 58"',
    ],
    equipment: [
      { equipmentId: 'speaker', quantity: 2 },
      { equipmentId: 'subwoofer', quantity: 2 },
      { equipmentId: 'wash', quantity: 4 },
      { equipmentId: 'beam', quantity: 4 },
      { equipmentId: 'smoke-machine', quantity: 1 },
      { equipmentId: 'cold-spark', quantity: 4 },
      { equipmentId: 'led-screen', quantity: 2 },
      { equipmentId: 'truss', quantity: 2 },
      { equipmentId: 'dj-booth', quantity: 1 },
      { equipmentId: 'dj', quantity: 1 },
      { equipmentId: 'light-operator', quantity: 1 },
      { equipmentId: 'botarga', quantity: 2 },
    ],
  },
  {
    id: 'experience',
    name: 'Ultimate Experience',
    tagline: 'Cuando la pista no perdona.',
    description: 'Producción total para eventos de 250+ personas.',
    basePrice: 21000,
    hours: 5,
    maxGuests: 400,
    image: '/img/paquete-ultimate-800.webp',
    highlights: [
      '4 medios activos + 4 subwoofer',
      '6 luces Wash LED + 8 cabezas Beam 7R',
      'Humo + confetti con CO₂ + láser + 4 chisperos en frío',
      'DJ + operador de luces + 2 botargas',
      'Robot LED (40 min)',
      '2 micrófonos inalámbricos',
    ],
    equipment: [
      { equipmentId: 'speaker', quantity: 4 },
      { equipmentId: 'subwoofer', quantity: 4 },
      { equipmentId: 'wash', quantity: 6 },
      { equipmentId: 'beam', quantity: 8 },
      { equipmentId: 'smoke-machine', quantity: 1 },
      { equipmentId: 'co2-confetti', quantity: 1 },
      { equipmentId: 'laser', quantity: 1 },
      { equipmentId: 'cold-spark', quantity: 4 },
      // PROVISIONAL: el sitio no lista pantallas en este paquete; se usan las 3 del montaje modelado.
      { equipmentId: 'led-screen', quantity: 3 },
      { equipmentId: 'truss', quantity: 3 },
      { equipmentId: 'dj-booth', quantity: 1 },
      { equipmentId: 'dj', quantity: 1 },
      { equipmentId: 'light-operator', quantity: 1 },
      { equipmentId: 'botarga', quantity: 2 },
      { equipmentId: 'robot-led', quantity: 1 },
      { equipmentId: 'wireless-mic', quantity: 2 },
    ],
  },
];

/** PROVISIONAL: todos los precios de extras son de arranque. */
export const DEFAULT_ADDONS: Addon[] = [
  { id: 'led-floor', name: 'Pista iluminada', description: 'Pista de baile iluminada al centro del salón.', price: 4500, maxQuantity: 1, equipmentId: 'led-floor', dependencies: [], requiresApproval: false, minArea: 60, active: true },
  { id: 'led-screen', name: 'Pantalla extra', description: 'Pantalla adicional para video, fotos o tu logo.', price: 1200, maxQuantity: 4, equipmentId: 'led-screen', dependencies: [], requiresApproval: false, active: true },
  { id: 'projection', name: 'Proyección', description: 'Proyector con pantalla para video o presentaciones.', price: 1500, maxQuantity: 1, equipmentId: 'projector', dependencies: [], requiresApproval: false, active: true },
  { id: 'robot-led', name: 'Robot LED', description: 'Robot LED en pista durante 40 minutos.', price: 2500, maxQuantity: 2, equipmentId: 'robot-led', dependencies: [], requiresApproval: false, minHeight: 2.8, active: true },
  { id: 'cold-spark', name: 'Chispas frías', description: 'Chisperos en frío extra para entradas y momentos clímax.', price: 500, maxQuantity: 8, equipmentId: 'cold-spark', dependencies: [], requiresApproval: false, minHeight: 3, active: true },
  { id: 'moving-head', name: 'Cabezas móviles', description: 'Cabezas Beam 7R adicionales.', price: 600, maxQuantity: 8, equipmentId: 'beam', dependencies: [], requiresApproval: false, minHeight: 2.8, active: true },
  { id: 'wash', name: 'Wash lights', description: 'Luces Wash LED adicionales para bañar de color.', price: 300, maxQuantity: 8, equipmentId: 'wash', dependencies: [], requiresApproval: false, active: true },
  { id: 'smoke-machine', name: 'Máquina de humo extra', description: 'Más humo para marcar los haces de luz.', price: 400, maxQuantity: 2, equipmentId: 'smoke-machine', dependencies: [], requiresApproval: true, active: true },
  { id: 'low-fog', name: 'Humo bajo', description: 'Alfombra de humo para el primer baile.', price: 1800, maxQuantity: 1, equipmentId: 'low-fog', dependencies: [], requiresApproval: true, active: true },
  { id: 'wireless-mic', name: 'Micrófonos inalámbricos', description: 'Micrófonos de mano inalámbricos.', price: 350, maxQuantity: 4, equipmentId: 'wireless-mic', dependencies: [], requiresApproval: false, active: true },
  { id: 'pixel-booth', name: 'Cabina pixel LED', description: 'Cambia la cabina por una de paneles de pixel LED.', price: 1500, maxQuantity: 1, equipmentId: 'dj-booth-pixel', replacesEquipmentId: 'dj-booth', dependencies: [], requiresApproval: false, active: true },
  { id: 'co2-confetti', name: 'Confetti con CO₂', description: 'Cañón de CO₂ que cubre la pista de confetti.', price: 1500, maxQuantity: 2, equipmentId: 'co2-confetti', dependencies: [], requiresApproval: true, active: true },
  { id: 'flamethrower', name: 'Lanzallamas', description: 'Columnas de fuego sincronizadas con la música.', price: 2000, maxQuantity: 2, equipmentId: 'flamethrower', dependencies: [], requiresApproval: true, minHeight: 4, active: true },
  { id: 'extra-hour', name: 'Hora extra', description: 'Una hora más de evento con todo el montaje.', price: 1500, maxQuantity: 5, equipmentId: null, dependencies: [], requiresApproval: false, active: true },
];

export const DEFAULT_PRICING: PricingConfig = {
  currency: 'MXN',
  roundTo: 50,
  disclaimer:
    'El precio mostrado es una estimación. La cotización final puede variar según ubicación, fecha, montaje y requerimientos técnicos. Precios sin IVA.',
};

export const DEFAULT_CATALOG: Catalog = {
  eventTypes: DEFAULT_EVENT_TYPES,
  equipment: DEFAULT_EQUIPMENT,
  packages: DEFAULT_PACKAGES,
  addons: DEFAULT_ADDONS,
  pricing: DEFAULT_PRICING,
};
