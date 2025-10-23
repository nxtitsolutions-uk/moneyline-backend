// models/userPredictionModel.js
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

// If you already export SUPPORTED_SPORTS from adminVoteModel, reuse it:
let SUPPORTED_SPORTS;
try {
  ({ SUPPORTED_SPORTS } = require("./adminVoteModel"));
} catch {
  SUPPORTED_SPORTS = ["NFL", "NBA", "SOCCER", "CRICKET", "NHL", "MLB", "UFC"];
}

const teamMiniSchema = new Schema(
  {
    id: { type: String, required: false, trim: true },
    name: { type: String, required: false, trim: true },
    logo: { type: String, required: false, trim: true },
    score: { type: Number, required: false },
  },
  { _id: false }
);

const providerSnapshotSchema = new Schema(
  {
    leagueId: { type: String, trim: true },
    leagueName: { type: String, trim: true },
    scheduledAt: { type: Date },
    status: { type: String, trim: true }, // e.g. "NS", "LIVE", "FT"
    homeTeam: teamMiniSchema,
    awayTeam: teamMiniSchema,
  },
  { _id: false }
);

const userPredictionSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, index: true },

    sportType: {
      type: String,
      required: true,
      enum: SUPPORTED_SPORTS,
      index: true,
    },

    // External provider match id (string to be agnostic: numeric/GUID both ok)
    matchId: { type: String, required: true, index: true },

    // What the user predicted
    selectedTeamId: { type: String, required: true },
    selectedTeamName: { type: String, required: true, trim: true },
    predictedAt: { type: Date, default: Date.now },

    // Optional lock if you disallow edits after kickoff
    lockedAt: { type: Date },

    // Resolution fields (filled when result is known)
    settledAt: { type: Date },
    outcomeTeamId: { type: String },
    outcomeTeamName: { type: String, trim: true },
    isCorrect: { type: Boolean },

    // Lightweight snapshot from provider to render cards fast
    providerSnapshot: providerSnapshotSchema,
  },
  { timestamps: true }
);

// Only one prediction per user for a given match in a sport
userPredictionSchema.index(
  { user: 1, sportType: 1, matchId: 1 },
  { unique: true, name: "uniq_user_match_prediction" }
);

// Useful secondary indices
userPredictionSchema.index({ user: 1, settledAt: -1 });
userPredictionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("UserPrediction", userPredictionSchema);
