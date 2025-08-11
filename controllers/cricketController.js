// controllers/cricketController.js
const svc = require("../services/cricketService");

exports.getScheduleByDate = async (req, res) => {
  try {
    const { date } = req.params; // YYYY-MM-DD
    const locale = (req.query.locale || "en").toLowerCase();
    const out = await svc.getDailySchedule({ locale, date });
    res.json({ ok: true, ...out });
  } catch (e) {
    res.status(e.status || 500).json({ ok: false, error: e.message, details: e.body || null });
  }
};

exports.getLineups = async (req, res) => {
  try {
    const { urn } = req.params;   // sr:match:123
    const locale = (req.query.locale || "en").toLowerCase();
    const out = await svc.getLineups({ locale, matchUrn: urn });
    res.json({ ok: true, ...out });
  } catch (e) {
    res.status(e.status || 500).json({ ok: false, error: e.message, details: e.body || null });
  }
};
