const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    // Basic Info
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    profilePicture: { type: String },

    // Sports & Teams
    favoriteSports: [{ type: String }], // Example: ["NBA", "Cricket"]

    // Key = sport name, Value = array of teams
    favoriteTeams: {
      type: Map,
      of: [String],
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
