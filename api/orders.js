const { sql, ensureTables } = require('./_lib/db');

function parseJson(value, fallback) {
  return JSON.stringify(value ?? fallback);
}

module.exports = async function handler(req, res) {
  try {
    await ensureTables();

    if (req.method === 'GET') {
      const { q = '', phone = '' } = req.query;
      const hasFilter = q || phone;
      const rows = hasFilter
        ? await sql`
            SELECT * FROM orders
            WHERE order_id ILIKE ${`%${q}%`}
              OR phone_number ILIKE ${`%${phone || q}%`}
            ORDER BY created_at DESC
          `
        : await sql`SELECT * FROM orders ORDER BY created_at DESC`;

      res.status(200).json({ orders: rows });
      return;
    }

    if (req.method === 'POST') {
      const order = req.body || {};

      const rows = await sql`
        INSERT INTO orders (
          id, order_id, schema_version, customer_name, phone_number, brand, device_type, complaint,
          damage_type, estimated_cost, final_estimated_cost, promo_code, discount_amount, before_images,
          after_images, assigned_technician, messages, notifications, customer_rating, customer_review, status,
          created_at, updated_at, completed_at, warranty_days, notes, parts_used, satisfaction_label, technician_report
        ) VALUES (
          ${order.id},
          ${order.order_id},
          ${order.schema_version || 2},
          ${order.customer_name},
          ${order.phone_number},
          ${order.brand},
          ${order.device_type},
          ${order.complaint},
          ${order.damage_type || ''},
          ${order.estimated_cost || 'Rp 0'},
          ${order.final_estimated_cost || ''},
          ${order.promo_code || ''},
          ${Number(order.discount_amount || 0)},
          ${parseJson(order.before_images, [])}::jsonb,
          ${parseJson(order.after_images, [])}::jsonb,
          ${order.assigned_technician || ''},
          ${parseJson(order.messages, [])}::jsonb,
          ${parseJson(order.notifications, [])}::jsonb,
          ${Number(order.customer_rating || 0)},
          ${order.customer_review || ''},
          ${order.status || 'Order Diterima'},
          ${order.created_at || new Date().toISOString()},
          ${order.updated_at || new Date().toISOString()},
          ${order.completed_at || null},
          ${Number(order.warranty_days || 30)},
          ${order.notes || ''},
          ${parseJson(order.parts_used, [])}::jsonb,
          ${order.satisfaction_label || ''},
          ${order.technician_report || ''}
        )
        RETURNING *
      `;

      res.status(201).json({ order: rows[0] });
      return;
    }

    if (req.method === 'PUT') {
      const order = req.body || {};
      const rows = await sql`
        UPDATE orders
        SET
          schema_version = ${order.schema_version || 2},
          customer_name = ${order.customer_name},
          phone_number = ${order.phone_number},
          brand = ${order.brand},
          device_type = ${order.device_type},
          complaint = ${order.complaint},
          damage_type = ${order.damage_type || ''},
          estimated_cost = ${order.estimated_cost || 'Rp 0'},
          final_estimated_cost = ${order.final_estimated_cost || ''},
          promo_code = ${order.promo_code || ''},
          discount_amount = ${Number(order.discount_amount || 0)},
          before_images = ${parseJson(order.before_images, [])}::jsonb,
          after_images = ${parseJson(order.after_images, [])}::jsonb,
          assigned_technician = ${order.assigned_technician || ''},
          messages = ${parseJson(order.messages, [])}::jsonb,
          notifications = ${parseJson(order.notifications, [])}::jsonb,
          customer_rating = ${Number(order.customer_rating || 0)},
          customer_review = ${order.customer_review || ''},
          status = ${order.status || 'Order Diterima'},
          updated_at = ${order.updated_at || new Date().toISOString()},
          completed_at = ${order.completed_at || null},
          warranty_days = ${Number(order.warranty_days || 30)},
          notes = ${order.notes || ''},
          parts_used = ${parseJson(order.parts_used, [])}::jsonb,
          satisfaction_label = ${order.satisfaction_label || ''},
          technician_report = ${order.technician_report || ''}
        WHERE id = ${order.id}
        RETURNING *
      `;

      res.status(200).json({ order: rows[0] || null });
      return;
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      await sql`DELETE FROM orders WHERE id = ${id}`;
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Order request failed' });
  }
};
