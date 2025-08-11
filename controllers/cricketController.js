// controllers/cricketController.js
const svc = require("../services/cricketService");
const Latest = require("../models/latestModel");
const Snapshot = require("../models/snapshotModel");

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

//  GET latest backed-up cricket resource from DB
exports.getLatestFromDb = async (req, res) => {
  try {
    const { feed, id } = req.params;
    const locale = (req.query.locale || "en").toLowerCase();

    const latest = await Latest.findOne({
      vendor: "sportradar",
      sport: "cricket",
      feed,
      resourceId: id,
      locale
    }).lean();

    if (!latest) {
      return res.status(404).json({ ok: false, error: "No backup found" });
    }

    res.json({ ok: true, from: "db", latest });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

// GET all historical snapshots for a resource
exports.getSnapshotsFromDb = async (req, res) => {
  try {
    const { feed, id } = req.params;
    const locale = (req.query.locale || "en").toLowerCase();

    const snaps = await Snapshot.find({
      vendor: "sportradar",
      sport: "cricket",
      feed,
      resourceId: id,
      locale
    })
      .sort({ fetchedAt: -1 })
      .lean();

    if (!snaps.length) {
      return res.status(404).json({ ok: false, error: "No snapshots found" });
    }

    res.json({ ok: true, from: "db", count: snaps.length, snapshots: snaps });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};
