// models/adminVoteModel.js
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

// Maintain a single "global admin vote" per (sportType, matchId)
const SUPPORTED_SPORTS = ["NFL", "NBA", "SOCCER", "CRICKET", "NHL", "MLB", "UFC"];

const adminVoteSchema = new Schema(
  {
    sportType: {
      type: String,
      required: true,
      enum: SUPPORTED_SPORTS,
      index: true,
    },

    // Use string for flexibility across providers (IDs can be numeric or GUID-like)
    matchId: {
      type: String,
      required: true,
      index: true,
    },

    selectedTeamId: { type: String, required: true }, // string for cross-provider compatibility
    selectedTeamName: { type: String, required: true, trim: true },

    // Audit trail: who changed it last
    votedBy: { type: Types.ObjectId, ref: "User", required: true },
    votedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique vote per sportType+matchId (global admin pick)
adminVoteSchema.index({ sportType: 1, matchId: 1 }, { unique: true });

module.exports = {
  AdminVote: mongoose.model("AdminVote", adminVoteSchema),
  SUPPORTED_SPORTS,
};
