const { getSql, ensureSchema } = require("../lib/db");

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function normalizeBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

module.exports = async (req, res) => {
  try {
    const sql = getSql();
    await ensureSchema(sql);

    if (req.method === "GET") {
      const rawLimit = Number.parseInt(req.query.limit || "20", 10);
      const limit = Number.isNaN(rawLimit) ? 20 : Math.max(1, Math.min(rawLimit, 100));
      const bookingId = Number.parseInt(req.query.id || "", 10);

      if (!Number.isNaN(bookingId)) {
        const booking = await sql`
          SELECT
            id,
            full_name,
            wa_number,
            phone_model,
            issue_description,
            appointment_date,
            appointment_time,
            status,
            created_at
          FROM bookings
          WHERE id = ${bookingId}
          LIMIT 1
        `;

        if (!booking.length) {
          return sendJson(res, 404, { error: "Booking not found." });
        }

        return sendJson(res, 200, { booking: booking[0] });
      }

      const bookings = await sql`
        SELECT
          id,
          full_name,
          wa_number,
          phone_model,
          issue_description,
          appointment_date,
          appointment_time,
          status,
          created_at
        FROM bookings
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;

      return sendJson(res, 200, { bookings });
    }

    if (req.method === "POST") {
      const body = normalizeBody(req);
      const fullName = (body.fullName || "").trim();
      const waNumber = (body.waNumber || "").trim();
      const phoneModel = (body.phoneModel || "").trim();
      const issueDescription = (body.issueDescription || "").trim();
      const appointmentDate = body.appointmentDate || null;
      const appointmentTime = body.appointmentTime || null;

      if (!fullName || !waNumber || !phoneModel || !issueDescription) {
        return sendJson(res, 400, {
          error: "Full name, WhatsApp number, phone model, and issue description are required.",
        });
      }

      const inserted = await sql`
        INSERT INTO bookings (
          full_name,
          wa_number,
          phone_model,
          issue_description,
          appointment_date,
          appointment_time
        )
        VALUES (
          ${fullName},
          ${waNumber},
          ${phoneModel},
          ${issueDescription},
          ${appointmentDate},
          ${appointmentTime}
        )
        RETURNING
          id,
          full_name,
          wa_number,
          phone_model,
          issue_description,
          appointment_date,
          appointment_time,
          status,
          created_at
      `;

      return sendJson(res, 201, { booking: inserted[0] });
    }

    res.setHeader("Allow", "GET, POST");
    return sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    console.error("Bookings API error:", error);
    return sendJson(res, 500, { error: "Internal server error." });
  }
};
