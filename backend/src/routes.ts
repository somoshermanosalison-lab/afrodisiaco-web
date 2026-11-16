import {
  QUOTE_STATUSES,
  addonPatchSchema,
  calculatePrice,
  catalogIdSchema,
  contactSchema,
  equipmentPatchSchema,
  packagePatchSchema,
  quoteRequestSchema,
  quoteStatusSchema,
  resolveSetup,
  sanitizeAddons,
} from '@afrodisiaco/shared';
import { Router, type RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { requireAdmin, sanitizeDeep } from './middleware';
import {
  clearCatalogCache,
  getCatalog,
  isCatalogEditable,
  updateAddon,
  updateEquipment,
  updatePackage,
} from './repositories/catalogRepository';
import { insertContact, insertQuote, listQuotes, updateQuoteStatus } from './repositories/quotesRepository';

const writeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false });

export const publicRouter = Router();

publicRouter.get('/health', (_req, res) => {
  res.json({ ok: true });
});

publicRouter.get('/equipment', async (_req, res) => {
  res.json((await getCatalog()).equipment);
});

publicRouter.get('/packages', async (_req, res) => {
  res.json((await getCatalog()).packages);
});

publicRouter.get('/addons', async (_req, res) => {
  res.json((await getCatalog()).addons.filter((a) => a.active));
});

publicRouter.post('/quotes', writeLimiter, async (req, res) => {
  const request = quoteRequestSchema.parse(sanitizeDeep(req.body));
  const catalog = await getCatalog();
  const config = request.configuration;

  // El servidor recalcula todo: nunca se confía en el precio ni el equipo del navegador.
  const setup = resolveSetup(config, catalog);
  if (!setup.inventoryOk) {
    res.status(409).json({
      error: 'inventory',
      message: 'No contamos actualmente con suficientes unidades para esta configuración.',
    });
    return;
  }
  const addons = sanitizeAddons(config.addons, catalog);
  const price = calculatePrice(config, catalog);
  const equipment = setup.equipment.map((l) => ({ id: l.equipment.id, name: l.equipment.name, quantity: l.quantity }));

  const id = await insertQuote({ ...request, configuration: { ...config, addons } }, equipment, addons, price.total);
  res.status(201).json({ id, estimatedPrice: price.total });
});

publicRouter.post('/contact', writeLimiter, async (req, res) => {
  const contact = contactSchema.parse(sanitizeDeep(req.body));
  const id = await insertContact(contact);
  res.status(201).json({ id });
});

/** Endpoints de administración: requieren `Authorization: Bearer <ADMIN_TOKEN>`. */
export const adminRouter = Router();
adminRouter.use(requireAdmin);

adminRouter.get('/quotes', async (req, res) => {
  const query = z
    .object({
      limit: z.coerce.number().int().min(1).max(200).default(50),
      status: z.enum(QUOTE_STATUSES).optional(),
    })
    .parse(req.query);
  res.json(await listQuotes(query.limit, query.status));
});

// Catálogo completo (incluye extras inactivos) y si se puede editar.
adminRouter.get('/catalog', async (_req, res) => {
  clearCatalogCache();
  const catalog = await getCatalog();
  res.json({ editable: await isCatalogEditable(), equipment: catalog.equipment, packages: catalog.packages, addons: catalog.addons });
});

const patchRoute = <T>(schema: z.ZodType<T>, update: (id: string, patch: T) => Promise<boolean>): RequestHandler =>
  async (req, res) => {
    const id = catalogIdSchema.parse(req.params.id);
    const patch = schema.parse(req.body);
    if (!(await update(id, patch))) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    res.json({ id, ...patch });
  };

adminRouter.patch('/addons/:id', patchRoute(addonPatchSchema, updateAddon));
adminRouter.patch('/equipment/:id', patchRoute(equipmentPatchSchema, updateEquipment));
adminRouter.patch('/packages/:id', patchRoute(packagePatchSchema, updatePackage));

adminRouter.patch('/quotes/:id/status', async (req, res) => {
  const id = z.uuid().parse(req.params.id);
  const { status } = quoteStatusSchema.parse(req.body);
  if (!(await updateQuoteStatus(id, status))) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.json({ id, status });
});
