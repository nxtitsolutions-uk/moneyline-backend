const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const profileModel = require("../models/profileModel");
// const notificationSettingModel = require("../models/notificationSettingModel");
const refreshTokenModel = require("../models/refreshTokenModel");
const userModel = require("../models/userModel");
const deletedUserModel = require("../models/deletedUserModel");

// PATCH /users/:id — Update user profile (admin or user self)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = [
      "name",
      "email",
      "gender",
      "googleId",
      "appleId",
      "role",
      "provider",
      "subscriptionType",
      "isNotification",
    ];

    const filteredUpdates = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    // Check email uniqueness
    if (filteredUpdates.email) {
      const existing = await User.findOne({
        email: filteredUpdates.email,
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({ message: "email_in_use" });
      }
    }

    // Check Google ID uniqueness
    if (filteredUpdates.googleId) {
      const existing = await User.findOne({
        googleId: filteredUpdates.googleId,
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({ message: "google_id_in_use" });
      }
    }

    // Check Apple ID uniqueness
    if (filteredUpdates.appleId) {
      const existing = await User.findOne({
        appleId: filteredUpdates.appleId,
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({ message: "apple_id_in_use" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, filteredUpdates, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "user_not_found" });
    }

    return res.status(200).json({
      message: "user_updated",
      user: {
        userId: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
        provider: updatedUser.provider,
        subscriptionType: updatedUser.subscriptionType,
        isNotification: updatedUser.isNotification,
        isVerified: updatedUser.isVerified,
        isProfileCompleted: updatedUser.isProfileCompleted,
        googleId: updatedUser.googleId,
        appleId: updatedUser.appleId,
      },
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return res.status(500).json({ message: "server_error" });
  }
};

// PATCH /users/update-password — Authenticated users update password
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user._id;

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "password_required" });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "user_not_found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "incorrect_old_password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "password_updated" });
  } catch (error) {
    console.error("Update Password Error:", error);
    return res.status(500).json({ message: "server_error" });
  }
};

// get Coins
exports.getUserCoins = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("coins");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      coins: user.coins.toString() || 0,
    });
  } catch (error) {
    console.error("❌ Error fetching user coins:", error);
    return res.status(500).json({ message: "Server error fetching coins." });
  }
};

// exports.getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find({ isDeleted: false })
//       .select("-password -otp -otpExpiry -__v") // Exclude sensitive fields
//       .lean(); // Use lean for better performance

//     const populatedUsers = await Promise.all(
//       users.map(async (user) => {
//         const profile = await profileModel.findOne({ user: user._id }).lean();
//         const notificationSetting = await notificationSettingModel
//           .findOne({
//             user: user._id,
//           })
//           .lean();

//         return {
//           ...user,
//           profile,
//           notificationSetting,
//         };
//       })
//     );

//     res.status(200).json({ success: true, users: populatedUsers });
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res.status(500).json({ success: false, message: "Failed to fetch users" });
//   }
// };

// Toggle block/unblock user


exports.blockUser = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Toggle the block status
    user.isBlocked = !user.isBlocked;
    user.tokenVersion = user.tokenVersion + 1;
    await user.save();

    const refreshTokens = await refreshTokenModel.find({ user: user._id });
    // If user is blocked, revok all their refresh tokens
    if (user.isBlocked) {
      await refreshTokenModel.updateMany(
        { userId: user._id },
        {
          $set: {
            isRevoked: true,
            expiresAt: Date.now(),
          },
          $inc: {
            tokenVersion: 1,
          },
        }
      );
    }

    return res.status(200).json({
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully.`,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    console.error("Error toggling user block status:", error);
    return res.status(500).json({ message: "Server error updating user." });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const deletedBy = req.user._id;

    const userToDelete = await userModel.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found!" });
    }

    const userProfile = await profileModel.findOne({ user: userId });

    // Soft delete the user
    userToDelete.isDeleted = true;
    userToDelete.tokenVersion = userToDelete.tokenVersion + 1;

    // Record deleted user info
    await deletedUserModel.create({
      user: userId,
      firstName: userProfile?.firstName || "Unknown",
      lastName: userProfile?.lastName || "Unknown",
      phone: userProfile?.phone || "Unknown",
      deletedBy,
    });
    await refreshTokenModel.updateMany(
      { userId },
      {
        $set: {
          isRevoked: true,
          expiresAt: Date.now(),
        },
        $inc: {
          tokenVersion: 1,
        },
      }
    );
    await userToDelete.save();

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Server error deleting user." });
  }
};

// recover User
exports.recoverUser = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const userToRecover = await userModel.findById(userId);
    if (!userToRecover) {
      return res.status(404).json({ message: "User not found" });
    }

    userToRecover.isDeleted = false;
    await userToRecover.save();

    res.status(200).json({ message: "User Recovered successfully" });
  } catch (error) {
    console.error("Error recovering user:", error);
    return res.status(500).json({ message: "Server error recovering user." });
  }
};
