const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const RefreshToken = require("../models/refreshTokenModel");
const Profile = require("../models/profileModel");
const NotificationSettings = require("../models/notificationSettingsModel"); // Import the NotificationSettings model

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String },

    // OTP Verification
    isVerified: { type: Boolean, default: false },
    canResetPassword: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },

    // Social Providers
    provider: {
      type: String,
      default: "email",
      enum: ["email", "google", "apple"],
    },
    googleId: { type: String, unique: true, sparse: true },
    appleId: { type: String, unique: true, sparse: true },

    // Role Management
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // Subscription
    subscriptionType: {
      type: String,
      enum: ["free", "basic", "premium"],
      default: "free",
    },
    subscriptionExpiryDate: { type: Date,default: null },

    // device type
    deviceType: {
      type: String,
      enum: ["android", "ios"],
      default: "android",
    },

    // Meta
    isDeleted: { type: Boolean, default: false },
    isSubscribed: { type: Boolean, default: false },
    isProfileCompleted: { type: Boolean, default: false },
    isSocial: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Pre-save middleware to create default notification settings
userSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      // Create default notification settings for the newly created user
      const notificationSettings = new NotificationSettings({
        userId: this._id, // Use the user's _id once it's generated
        preferences: {
          game_reminders: false,
          voting_updates: false,
        },
      });

      await notificationSettings.save(); // Save the notification settings
      console.log(
        `✅ Default notification settings created for user: ${this._id}`
      );
      next(); // Continue saving the user
    } catch (error) {
      console.error(
        `❌ Error creating notification settings for user: ${this._id}`,
        error
      );
      next(error); // If error, pass it to the next middleware
    }
  } else {
    next(); // If not new, just continue with saving
  }
});

// Hook to clean up associated data upon user deletion
userSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;

  const userId = doc._id;

  try {
    await RefreshToken.deleteMany({ userId });
    await Profile.deleteOne({ user: userId });
    // Optionally, clean up other data associated with the user, e.g.:
    // await WorkoutPlan.deleteMany({ trainer: userId });
    // await Chat.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });

    console.log(`🧹 Cleaned up data for deleted user: ${userId}`);
  } catch (err) {
    console.error(`❌ Error cleaning up user data:`, err);
  }
});

module.exports = mongoose.model("User", userSchema);
