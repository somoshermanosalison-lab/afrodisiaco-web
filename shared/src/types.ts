export const EVENT_TYPE_IDS = [
  'xv',
  'wedding',
  'birthday',
  'private',
  'corporate',
  'graduation',
  'other',
] as const;
export type EventType = (typeof EVENT_TYPE_IDS)[number];

export const PRODUCTION_LEVEL_IDS = ['essential', 'premium', 'experience'] as const;
export type ProductionLevel = (typeof PRODUCTION_LEVEL_IDS)[number];

export const EQUIPMENT_CATEGORIES = ['sound', 'lighting', 'led', 'effects', 'dj', 'staging'] as const;
export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number];

/** Paleta de luz que la escena 3D usa según el tipo de evento. */
export interface LightingTheme {
  primary: string;
  secondary: string;
  /** true = las luces cambian de color con el tiempo. */
  dynamic: boolean;
}

export interface EventTypeInfo {
  id: EventType;
  name: string;
  description: string;
  lighting: LightingTheme;
  /** Multiplicador de complejidad sobre el subtotal (1 = sin recargo). */
  complexity: number;
}

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  /** Unidades que Afrodisíaco tiene disponibles para rentar. */
  quantityAvailable: number;
  /** Ruta pública del modelo .glb, o null si todavía no existe (se usa un placeholder). */
  model3D: string | null;
  image: string | null;
  description: string;
  /** true = no ocupa lugar en la escena (staff, souvenirs, micrófonos). */
  hiddenInScene?: boolean;
}

export interface EquipmentQuantity {
  equipmentId: string;
  quantity: number;
}

export interface ProductionPackage {
  id: ProductionLevel;
  name: string;
  tagline: string;
  description: string;
  basePrice: number;
  hours: number;
  /** Invitados que el audio del paquete cubre con comodidad. */
  maxGuests: number;
  image: string;
  highlights: string[];
  equipment: EquipmentQuantity[];
}

export interface Addon {
  id: string;
  name: string;
  description: string;
  /** Precio por unidad en MXN. */
  price: number;
  maxQuantity: number;
  /** Equipo de inventario que agrega cada unidad (null = servicio sin equipo). */
  equipmentId: string | null;
  /** Equipo del paquete que este addon sustituye (por ejemplo, la cabina). */
  replacesEquipmentId?: string;
  /** Otros addons que deben estar seleccionados antes. */
  dependencies: string[];
  /** true = requiere que Afrodisíaco confirme que el lugar lo permite. */
  requiresApproval: boolean;
  /** Altura mínima del lugar en metros, si aplica. */
  minHeight?: number;
  /** Área mínima del lugar en m², si aplica. */
  minArea?: number;
  active: boolean;
}

export interface PricingConfig {
  currency: 'MXN';
  /** Múltiplo al que se redondea el total. */
  roundTo: number;
  disclaimer: string;
}

export interface Catalog {
  eventTypes: EventTypeInfo[];
  equipment: Equipment[];
  packages: ProductionPackage[];
  addons: Addon[];
  pricing: PricingConfig;
}

export interface VenueDimensions {
  width: number;
  length: number;
  height: number;
}

/** Selección del cliente. Los campos null son pasos que todavía no completa. */
export interface Configuration {
  eventType: EventType | null;
  guests: number;
  venue: VenueDimensions;
  level: ProductionLevel | null;
  /** addonId -> cantidad (solo cantidades > 0). */
  addons: Record<string, number>;
}

export type NoticeSeverity = 'info' | 'warning' | 'error';

export interface Notice {
  code: string;
  severity: NoticeSeverity;
  message: string;
}

export interface EquipmentLine {
  equipment: Equipment;
  quantity: number;
  /** Cuántas unidades vienen del paquete y cuántas de extras. */
  fromPackage: number;
  fromAddons: number;
}

export interface ResolvedSetup {
  area: number;
  volume: number;
  recommendedLevel: ProductionLevel;
  equipment: EquipmentLine[];
  notices: Notice[];
  /** false si la configuración pide más unidades de las que hay. */
  inventoryOk: boolean;
}

export interface PriceLine {
  label: string;
  amount: number;
}

export interface PriceBreakdown {
  lines: PriceLine[];
  subtotal: number;
  complexityAmount: number;
  total: number;
  currency: 'MXN';
}

export const QUOTE_STATUSES = ['pending', 'contacted', 'quoted', 'confirmed', 'cancelled'] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];
