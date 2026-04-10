const { neon } = require("@neondatabase/serverless");

function getSql() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return neon(connectionString);
}

async function ensureSchema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      wa_number TEXT NOT NULL,
      phone_model TEXT NOT NULL,
      issue_description TEXT NOT NULL,
      appointment_date DATE,
      appointment_time TIME,
      status TEXT NOT NULL DEFAULT 'new_request',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

module.exports = {
  getSql,
  ensureSchema,
};
