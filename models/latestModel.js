// models/Latest.js
const mongoose = require("mongoose");

const latestSchema = new mongoose.Schema({
  vendor: { type: String, required: true, enum: ["sportradar"] },
  sport:  { type: String, required: true },
  feed:   { type: String, required: true },
  resourceId: { type: String, required: true },
  locale: { type: String, default: "en" },

  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  payloadHash: { type: String, required: true },
  fetchedAt: { type: Date, default: Date.now },
  validUntil: { type: Date }, // fetchedAt + validForSec

  isLive: { type: Boolean, default: false },
}, { timestamps: true });

latestSchema.index({ vendor: 1, sport: 1, feed: 1, resourceId: 1, locale: 1 }, { unique: true });

module.exports = mongoose.model("Latest", latestSchema);
