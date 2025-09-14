const Profile = require("../models/profileModel");
const User = require("../models/userModel");
const NotificationSettings = require('../models/notificationSettingsModel');


// ✅ Create Profile (All in one)
exports.createProfile = async (req, res) => {
  try {
    const { name, username, profilePicture, favoriteSports, favoriteTeams } = req.body;

    // Check if username exists
    const existingUsername = await Profile.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken." });
    }

    // Check if profile already exists for user
    const existingProfile = await Profile.findOne({ user: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists." });
    }

    // ✅ Create new profile
    const profile = await Profile.create({
      user: req.user._id,
      name,
      username,
      profilePicture,
      favoriteSports: favoriteSports || [],
      favoriteTeams: favoriteTeams || {},
    });

    // ✅ Update user to mark profile as completed
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isProfileCompleted: true },
      { new: true }
    ).lean();

    // 👤 Include the profile
    const fullProfile = await Profile.findOne({ user: user._id }).lean();

    // 🔔 Include the notification settings (create default if not exist)
    let notifications = await NotificationSettings.findOne({ userId: user._id }).lean();
    if (!notifications) {
      notifications = await NotificationSettings.create({
        userId: user._id,
        preferences: {
          game_reminders: true,
          voting_updates: true,
        },
      });
    }

    // ✅ Respond with user, profile, and notification settings
    res.status(201).json({
      message: "Profile created successfully",
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        provider: user.provider,
        isVerified: user.isVerified,
        isProfileCompleted: user.isProfileCompleted,
        isSubscribed: user.isSubscribed,
        subscriptionExpiryDate: user.subscriptionExpiryDate,
        deviceType: user.deviceType,
        subscriptionType: user.subscriptionType,
        profile: fullProfile,
        notifications, // included notification settings
      },
    });
  } catch (error) {
    console.error("Create profile error:", error);
    res.status(500).json({ message: "Failed to create profile" });
  }
};

// ✅ Get Profile
exports.getProfile = async (req, res) => {
  try {
    // Fetch the user
    const user = await User.findById(req.user._id).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch the profile
    const profile = await Profile.findOne({ user: user._id }).lean();

    // Fetch notification settings
    let notifications = await NotificationSettings.findOne({ userId: user._id }).lean();
    if (!notifications) {
      // create default settings if they don't exist
      notifications = await NotificationSettings.create({
        userId: user._id,
        preferences: {
          game_reminders: true,
          voting_updates: true,
        },
      });
    }

    // Respond with full user object
    res.status(200).json({
      message: "Profile fetched successfully",
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        provider: user.provider,
        isVerified: user.isVerified,
        isProfileCompleted: user.isProfileCompleted,
        isSubscribed: user.isSubscribed,
        subscriptionExpiryDate: user.subscriptionExpiryDate,
        deviceType: user.deviceType,
        subscriptionType: user.subscriptionType,
        profile,
        notifications,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};


// ✅ Update Profile (any field)
exports.updateProfile = async (req, res) => {
  try {
    const { username } = req.body;

    // If username is being updated, check if it's taken by someone else
    if (username) {
      const existingUsername = await Profile.findOne({
        username,
        user: { $ne: req.user._id },
      });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken." });
      }
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", profile: updatedProfile });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// ✅ Delete Profile
exports.deleteProfile = async (req, res) => {
  try {
    await Profile.findOneAndDelete({ user: req.user._id });
    await User.findByIdAndUpdate(req.user._id, { isProfileCompleted: false });

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Delete profile error:", error);
    res.status(500).json({ message: "Failed to delete profile" });
  }
};

exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.query; // or req.body if you prefer POST
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const existing = await Profile.findOne({ username });
    if (existing) {
      return res.status(200).json({ available: false, message: "Username already taken" });
    }

    res.status(200).json({ available: true, message: "Username is available" });
  } catch (error) {
    console.error("Check username error:", error);
    res.status(500).json({ message: "Failed to check username availability" });
  }
};

