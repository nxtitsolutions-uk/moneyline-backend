// models/sportModel.js
const mongoose = require("mongoose");

const SportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true }, // e.g., 'nba', 'cricket'
    icon: { type: String }, 
  },
  { timestamps: true }
);

SportSchema.index({ slug: 1 });

module.exports = mongoose.model("Sport", SportSchema);
