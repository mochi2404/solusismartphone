const { sql, ensureTables } = require('./_lib/db');

module.exports = async function handler(req, res) {
  try {
    await ensureTables();

    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM inventory_items ORDER BY name ASC`;
      res.status(200).json({ inventory: rows });
      return;
    }

    if (req.method === 'PUT') {
      const { inventory = [] } = req.body || {};
      await sql`DELETE FROM inventory_items`;

      for (const item of inventory) {
        await sql`
          INSERT INTO inventory_items (id, name, category, stock, reorder_level, unit_cost, supplier, updated_at)
          VALUES (
            ${item.id},
            ${item.name || 'Unknown Part'},
            ${item.category || 'General'},
            ${Number(item.stock || 0)},
            ${Number(item.reorder_level || 0)},
            ${Number(item.unit_cost || 0)},
            ${item.supplier || ''},
            ${item.updated_at || new Date().toISOString()}
          )
        `;
      }

      const rows = await sql`SELECT * FROM inventory_items ORDER BY name ASC`;
      res.status(200).json({ inventory: rows });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Inventory request failed' });
  }
};
