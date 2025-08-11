// models/Snapshot.js
const mongoose = require("mongoose");

const snapshotSchema = new mongoose.Schema({
  vendor: { type: String, required: true, enum: ["sportradar"] },
  sport:  { type: String, required: true }, // cricket, soccer, nba, ...
  feed:   { type: String, required: true }, // schedules, standings, teams, ...
  resourceId: { type: String, required: true }, // e.g. "sr:match:28669992" or "2025-08-10"
  locale: { type: String, default: "en" },

  // data
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  payloadHash: { type: String, required: true }, // content hash to de-dupe versions

  // freshness
  fetchedAt: { type: Date, default: Date.now },
  validForSec: { type: Number, default: 0 }, // derived from vendor TTL if provided

  // classification
  isLive: { type: Boolean, default: false }, // your decision at fetch time
}, { timestamps: true });

snapshotSchema.index({ vendor: 1, sport: 1, feed: 1, resourceId: 1, locale: 1, fetchedAt: -1 });

// Optional: keep only N days of history (Mongo TTL)
snapshotSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 }); // 30 days

module.exports = mongoose.model("Snapshot", snapshotSchema);
