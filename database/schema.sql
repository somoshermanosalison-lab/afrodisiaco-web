-- Esquema de la base de datos de Afrodisíaco (PostgreSQL).
-- Aplicar con:  psql "$DATABASE_URL" -f database/schema.sql
-- Después sembrar el catálogo con:  npm run db:seed

CREATE TABLE IF NOT EXISTS equipment (
  id                 TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  category           TEXT NOT NULL CHECK (category IN ('sound','lighting','led','effects','dj','staging')),
  quantity_available INTEGER NOT NULL CHECK (quantity_available >= 0),
  model_3d           TEXT,
  image              TEXT,
  description        TEXT NOT NULL DEFAULT '',
  hidden_in_scene    BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order         INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS packages (
  id          TEXT PRIMARY KEY CHECK (id IN ('essential','premium','experience')),
  name        TEXT NOT NULL,
  tagline     TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  base_price  INTEGER NOT NULL CHECK (base_price >= 0),
  hours       INTEGER NOT NULL CHECK (hours > 0),
  max_guests  INTEGER NOT NULL CHECK (max_guests > 0),
  image       TEXT NOT NULL DEFAULT '',
  highlights  JSONB NOT NULL DEFAULT '[]',
  -- [{ "equipmentId": "speaker", "quantity": 2 }, ...]
  equipment   JSONB NOT NULL DEFAULT '[]',
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS addons (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  description           TEXT NOT NULL DEFAULT '',
  price                 INTEGER NOT NULL CHECK (price >= 0),
  max_quantity          INTEGER NOT NULL CHECK (max_quantity >= 1),
  equipment_id          TEXT REFERENCES equipment(id),
  replaces_equipment_id TEXT REFERENCES equipment(id),
  dependencies          JSONB NOT NULL DEFAULT '[]',
  requires_approval     BOOLEAN NOT NULL DEFAULT FALSE,
  min_height            NUMERIC(5,2),
  min_area              NUMERIC(8,2),
  active                BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order            INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quotes (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name      TEXT NOT NULL,
  phone              TEXT NOT NULL,
  email              TEXT NOT NULL,
  city               TEXT NOT NULL,
  comments           TEXT NOT NULL DEFAULT '',
  event_type         TEXT NOT NULL,
  event_date         DATE NOT NULL,
  guests             INTEGER NOT NULL CHECK (guests BETWEEN 10 AND 2000),
  venue_width        NUMERIC(6,2) NOT NULL CHECK (venue_width > 0),
  venue_length       NUMERIC(6,2) NOT NULL CHECK (venue_length > 0),
  venue_height       NUMERIC(5,2) NOT NULL CHECK (venue_height > 0),
  production_level   TEXT NOT NULL,
  selected_equipment JSONB NOT NULL,
  selected_addons    JSONB NOT NULL,
  estimated_price    INTEGER NOT NULL CHECK (estimated_price >= 0),
  status             TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','contacted','quoted','confirmed','cancelled')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quotes_created_at_idx ON quotes (created_at DESC);
CREATE INDEX IF NOT EXISTS quotes_status_idx ON quotes (status);

CREATE TABLE IF NOT EXISTS contacts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
