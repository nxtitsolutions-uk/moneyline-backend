// models/notificationSettingsModel.js
const mongoose = require("mongoose");

const NotificationSettingsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true }, // Using 'userId' instead of 'user_id'
    preferences: {
      game_reminders: { type: Boolean, default: false },
      voting_updates: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

NotificationSettingsSchema.index({ userId: 1 });

module.exports = mongoose.model("NotificationSettings", NotificationSettingsSchema);
