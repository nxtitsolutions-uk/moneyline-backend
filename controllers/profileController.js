const Profile = require("../models/profileModel");
const User = require("../models/userModel");

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

    const profile = await Profile.create({
      user: req.user._id,
      name,
      username,
      profilePicture,
      favoriteSports: favoriteSports || [],
      favoriteTeams: favoriteTeams || {},
    });

    await User.findByIdAndUpdate(req.user._id, { isProfileCompleted: true });

    res.status(201).json({ message: "Profile created successfully", profile });
  } catch (error) {
    console.error("Create profile error:", error);
    res.status(500).json({ message: "Failed to create profile" });
  }
};

// ✅ Get Profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate({
      path: "user",
      select: "email role isVerified isProfileCompleted",
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ profile });
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
