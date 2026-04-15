const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Add your Neon connection string in Vercel environment variables.');
}

const sql = neon(process.env.DATABASE_URL);

let schemaReady = false;

async function ensureTables() {
  if (schemaReady) return;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_id TEXT UNIQUE NOT NULL,
      schema_version INTEGER NOT NULL DEFAULT 2,
      customer_name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      brand TEXT NOT NULL,
      device_type TEXT NOT NULL,
      complaint TEXT NOT NULL,
      damage_type TEXT DEFAULT '',
      estimated_cost TEXT DEFAULT 'Rp 0',
      final_estimated_cost TEXT DEFAULT '',
      promo_code TEXT DEFAULT '',
      discount_amount INTEGER DEFAULT 0,
      before_images JSONB DEFAULT '[]'::jsonb,
      after_images JSONB DEFAULT '[]'::jsonb,
      assigned_technician TEXT DEFAULT '',
      messages JSONB DEFAULT '[]'::jsonb,
      notifications JSONB DEFAULT '[]'::jsonb,
      customer_rating INTEGER DEFAULT 0,
      customer_review TEXT DEFAULT '',
      status TEXT DEFAULT 'Order Diterima',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      warranty_days INTEGER DEFAULT 30,
      notes TEXT DEFAULT '',
      parts_used JSONB DEFAULT '[]'::jsonb,
      satisfaction_label TEXT DEFAULT '',
      technician_report TEXT DEFAULT ''
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS promos (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      value INTEGER NOT NULL DEFAULT 0,
      usage_count INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      stock INTEGER NOT NULL DEFAULT 0,
      reorder_level INTEGER NOT NULL DEFAULT 0,
      unit_cost INTEGER NOT NULL DEFAULT 0,
      supplier TEXT DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  schemaReady = true;
}

module.exports = {
  sql,
  ensureTables
};
