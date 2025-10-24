// models/userPredictionModel.js
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

// Reuse supported sports from AdminVote if available
let SUPPORTED_SPORTS;
try {
  ({ SUPPORTED_SPORTS } = require("./adminVoteModel"));
} catch {
  SUPPORTED_SPORTS = ["NFL", "NBA", "SOCCER", "CRICKET", "NHL", "MLB", "UFC"];
}

const userPredictionSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, index: true },

    sportType: {
      type: String,
      required: true,
      enum: SUPPORTED_SPORTS,
      index: true,
    },

    matchId: { type: String, required: true, index: true },

    // Prediction info
    selectedTeamId: { type: String, required: true },
    selectedTeamName: { type: String, required: true },
    predictedAt: { type: Date, default: Date.now },

    // Result info (after match end)
    outcomeTeamId: { type: String },
    outcomeTeamName: { type: String },
    isCorrect: { type: Boolean },
    settledAt: { type: Date },

    // Snapshot for UI (updated frequently)
    providerSnapshot: {
      leagueName: String,
      scheduledAt: Date,
      status: String,
      homeTeam: { type: Object },
      awayTeam: { type: Object },
    },

    // FINAL MATCH RESULT JSON (complete payload from live service)
    matchResult: { type: Object, default: {} },
  },
  { timestamps: true }
);

// Ensure unique per user + match + sport
userPredictionSchema.index(
  { user: 1, sportType: 1, matchId: 1 },
  { unique: true }
);

module.exports = mongoose.model("UserPrediction", userPredictionSchema);
