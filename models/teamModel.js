// models/teamModel.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const TeamSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true }, 
    sport: { type: Schema.Types.ObjectId, ref: "Sport", required: true },
    league: { type: String }, 
    country: { type: String }, 
    logo: { type: String }, 
  },
  { timestamps: true }
);

// Prevent duplicate team slugs within the same sport
TeamSchema.index({ sport: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model("Team", TeamSchema);
