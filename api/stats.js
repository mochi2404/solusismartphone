const { getSql, ensureSchema } = require("../lib/db");

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

module.exports = async (_req, res) => {
  try {
    const sql = getSql();
    await ensureSchema(sql);

    const [totals] = await sql`
      SELECT
        COUNT(*)::int AS total_bookings,
        COUNT(*) FILTER (WHERE status IN ('new_request', 'confirmed', 'scheduled'))::int AS active_repairs,
        COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_repairs,
        COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW()))::int AS monthly_bookings
      FROM bookings
    `;

    return sendJson(res, 200, { stats: totals });
  } catch (error) {
    console.error("Stats API error:", error);
    return sendJson(res, 500, { error: "Internal server error." });
  }
};
