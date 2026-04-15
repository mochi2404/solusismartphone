const { sql, ensureTables } = require('./_lib/db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await ensureTables();

    const [orders, promos, inventory] = await Promise.all([
      sql`SELECT * FROM orders ORDER BY created_at DESC`,
      sql`SELECT * FROM promos ORDER BY created_at DESC`,
      sql`SELECT * FROM inventory_items ORDER BY name ASC`
    ]);

    res.status(200).json({
      orders,
      promos,
      inventory
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to load bootstrap data' });
  }
};
