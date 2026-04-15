const { sql, ensureTables } = require('./_lib/db');

module.exports = async function handler(req, res) {
  try {
    await ensureTables();

    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM promos ORDER BY created_at DESC`;
      res.status(200).json({ promos: rows });
      return;
    }

    if (req.method === 'PUT') {
      const { promos = [] } = req.body || {};
      await sql`DELETE FROM promos`;

      for (const promo of promos) {
        await sql`
          INSERT INTO promos (id, code, type, value, usage_count, is_active, created_at)
          VALUES (
            ${promo.id},
            ${String(promo.code || '').toUpperCase()},
            ${promo.type || 'Nominal'},
            ${Number(promo.value || 0)},
            ${Number(promo.usage_count || 0)},
            ${promo.is_active !== false},
            ${promo.created_at || new Date().toISOString()}
          )
        `;
      }

      const rows = await sql`SELECT * FROM promos ORDER BY created_at DESC`;
      res.status(200).json({ promos: rows });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Promo request failed' });
  }
};
