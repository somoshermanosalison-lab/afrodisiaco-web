import type { ContactRequest, QuoteRequest, QuoteStatus } from '@afrodisiaco/shared';
import { requirePool } from '../db';

export interface StoredQuote {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  city: string;
  comments: string;
  eventType: string;
  eventDate: string;
  guests: number;
  venueWidth: number;
  venueLength: number;
  venueHeight: number;
  productionLevel: string;
  selectedEquipment: { id: string; name: string; quantity: number }[];
  selectedAddons: Record<string, number>;
  estimatedPrice: number;
  status: QuoteStatus;
  createdAt: string;
}

const SELECT = `
  SELECT id, customer_name AS "customerName", phone, email, city, comments,
         event_type AS "eventType", to_char(event_date, 'YYYY-MM-DD') AS "eventDate", guests,
         venue_width::float AS "venueWidth", venue_length::float AS "venueLength",
         venue_height::float AS "venueHeight", production_level AS "productionLevel",
         selected_equipment AS "selectedEquipment", selected_addons AS "selectedAddons",
         estimated_price AS "estimatedPrice", status, created_at AS "createdAt"
  FROM quotes`;

export async function insertQuote(
  req: QuoteRequest,
  equipment: StoredQuote['selectedEquipment'],
  addons: Record<string, number>,
  estimatedPrice: number,
): Promise<string> {
  const { customer: c, configuration: cfg } = req;
  const res = await requirePool().query<{ id: string }>(
    `INSERT INTO quotes (customer_name, phone, email, city, comments, event_type, event_date, guests,
                         venue_width, venue_length, venue_height, production_level,
                         selected_equipment, selected_addons, estimated_price)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING id`,
    [
      c.customerName, c.phone, c.email, c.city, c.comments, cfg.eventType, c.eventDate, cfg.guests,
      cfg.venue.width, cfg.venue.length, cfg.venue.height, cfg.level,
      JSON.stringify(equipment), JSON.stringify(addons), estimatedPrice,
    ],
  );
  return res.rows[0].id;
}

export async function listQuotes(limit: number, status?: QuoteStatus): Promise<StoredQuote[]> {
  const res = status
    ? await requirePool().query<StoredQuote>(`${SELECT} WHERE status = $1 ORDER BY created_at DESC LIMIT $2`, [status, limit])
    : await requirePool().query<StoredQuote>(`${SELECT} ORDER BY created_at DESC LIMIT $1`, [limit]);
  return res.rows;
}

export async function updateQuoteStatus(id: string, status: QuoteStatus): Promise<boolean> {
  const res = await requirePool().query('UPDATE quotes SET status = $1 WHERE id = $2', [status, id]);
  return (res.rowCount ?? 0) > 0;
}

export async function insertContact(c: ContactRequest): Promise<string> {
  const res = await requirePool().query<{ id: string }>(
    'INSERT INTO contacts (name, phone, message) VALUES ($1,$2,$3) RETURNING id',
    [c.name, c.phone, c.message],
  );
  return res.rows[0].id;
}
