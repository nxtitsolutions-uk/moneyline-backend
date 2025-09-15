const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const appleSigninAuth = require("apple-signin-auth");
const User = require("../models/userModel");
const RefreshToken = require("../models/refreshTokenModel");
const Profile = require("../models/profileModel");
const Invitation = require("../models/invitationModel");
const { generateOtp } = require("../utils/generateOtp");
const { sendOtpEmail } = require("../services/emailService");
const { applyReferralToUser } = require("../controllers/invitationController");
const NotificationSettings = require('../models/notificationSettingsModel');

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokenService");


const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register a new user
exports.signup = async (req, res) => {
  try {
    const { email, password, confirmPassword, role = "", deviceToken } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required." });
    if (password && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "User already exists." });

    const { otp, expiry } = generateOtp();

    // ✅ Send OTP before creating user
    const otpSent = await sendOtpEmail(email, otp, "signup").then(() => true).catch(() => false);

    if (!otpSent) {
      return res.status(500).json({ message: "Could not send OTP email. Try again later." });
    }

    // ✅ Create user after OTP email success
    const userData = {
      email,
      role,
      otp,
      otpExpiry: expiry,
      canCreatePassword: !password,
      deviceToken,
    };

    if (password) {
      userData.password = await bcrypt.hash(password, 10);
    }

    // await User.create(userData);
    const newUser = new User(userData);  
    await newUser.save();

    return res.status(201).json({
      message: "Signup successful, OTP sent to email.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error during signup." });
  }
};

// ✅ Verify OTP & Apply Referral (if passed from frontend)
exports.verifyOtpForSignup = async (req, res) => {
  try {
    const { email, otp, referralToken } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.isVerified) {
      return res.status(400).json({ message: "Invalid or already verified." });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // ✅ Apply referral only after verification
    if (referralToken) {
      console.log("Applying referral:", referralToken);
      await applyReferralToUser(user._id, referralToken);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.status(200).json({
      message: "Signup verified successfully.",
      accessToken,
      refreshToken,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        provider: user.provider,
        canCreatePassword: user.canCreatePassword,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error during OTP verification." });
  }
};


// Resend OTP for signup verification
exports.resendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    console.log("user", user);
    if (!user || user.isVerified)
      return res.status(400).json({ message: "Invalid request." });

    const { otp, expiry } = generateOtp();
    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    await sendOtpEmail(email, otp, "signup");
    res.status(200).json({ message: "OTP resent to email." });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Server error while resending OTP." });
  }
};

// Authenticate user and issue tokens
exports.signin = async (req, res) => {
  try {
    const { email, password, deviceToken } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isVerified)
      return res.status(403).json({ message: "Invalid or unverified user." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    // ✅ Update deviceToken if provided and different
    if (deviceToken && deviceToken !== user.deviceToken) {
      user.deviceToken = deviceToken;
      await user.save();
      console.log("📲 Device token updated.");
    }

    // 🔐 Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    // 👤 Fetch profile
    const profile = await Profile.findOne({ user: user._id }).lean();
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

    res.status(200).json({
      message: "Signin successful.",
      accessToken,
      refreshToken,
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
        notifications
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Server error during signin." });
  }
};

// Generate OTP for password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found." });

    const { otp, expiry } = generateOtp();
    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    await sendOtpEmail(email, otp, "forgotPassword");
    res.status(200).json({ message: "OTP sent for password reset." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Verify OTP for password reset
exports.verifyOtpForForgotPassword = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.canResetPassword = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "OTP verified. You may reset password." });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Update user password after OTP verification
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.canResetPassword) {
      return res.status(403).json({ message: "Reset not allowed." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.canResetPassword = false;
    await user.save();

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Refresh access token using valid refresh token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  console.log("refresh-token", refreshToken);
  const storedToken = await RefreshToken.findOne({ token: refreshToken });

  if (
    !storedToken ||
    storedToken.isRevoked ||
    storedToken.expiresAt < new Date()
  ) {
    return res
      .status(403)
      .json({ message: "Token is already revoked or invalid." });
  }

  const user = await User.findById(storedToken.userId);
  // if (!user) return res.status(404).json({ message: "User not found." });

  // storedToken.isRevoked = true;
  // await storedToken.save();

  const newAccessToken = generateAccessToken(user);
  // const newRefreshToken = await generateRefreshToken(user);

  res.status(200).json({ accessToken: newAccessToken });
};

// Logout user by revoking refresh token
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  console.log("Refresh Token:", refreshToken);

  try {
    const token = await RefreshToken.findOne({ token: refreshToken });

    if (!token) {
      return res.status(404).json({ message: "Token not found." });
    }

    if (token.isRevoked) {
      return res
        .status(403)
        .json({ message: "Token is already revoked or invalid." });
    }

    token.isRevoked = true;
    await token.save();

    return res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    console.error("Error logging out:", err);
    return res
      .status(500)
      .json({ message: "An error occurred. Please try again." });
  }
};

// Send OTP to confirm account deletions
exports.requestDeleteAccountOtp = async (req, res) => {
  const { email } = req.body;
  if (email !== req.user.email) {
    return res.status(403).json({
      message:
        "The email address doesn't belong to your account. Please enter your registered email.",
    });
  }
  const user = await User.findOne({ email });
  if (!user || !user.isVerified)
    return res.status(404).json({ message: "User not found." });

  const { otp, expiry } = generateOtp();
  user.otp = otp;
  user.otpExpiry = expiry;
  await user.save();

  await sendOtpEmail(email, otp, "accountDeletion");
  res.status(200).json({ message: "OTP sent for account deletion." });
};

// Verify OTP and delete user account
exports.verifyDeleteAccountOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  await RefreshToken.deleteMany({ userId: user._id });
  await User.findByIdAndDelete(user._id);

  res.status(200).json({ message: "Account deleted successfully." });
};

// social login via google and apple oauth
exports.socialLogin = async (req, res) => {
  const { provider, token, platform = "android", role = "user", deviceToken } = req.body;

  if (!provider || !token) {
    return res.status(400).json({ message: "Provider and token are required." });
  }

  try {
    let userInfo = {};
    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const googleClient2 = new OAuth2Client(process.env.GOOGLE_CLIENT_ID_2);

    if (provider === "google") {
      let ticket;
      try {
        ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
      } catch (err) {
        ticket = await googleClient2.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID_2,
        });
      }

      const payload = ticket.getPayload();
      userInfo = {
        email: payload.email,
        name: payload.name,
        providerId: payload.sub,
      };
    } else if (provider === "apple") {
      try {
        const payload = await appleSigninAuth.verifyIdToken(token, {
          audience: process.env.APPLE_CLIENT_ID,
          ignoreExpiration: false,
        });

        userInfo = {
          email: payload.email,
          name: payload.name || "Apple User",
          providerId: payload.sub,
        };
      } catch (err) {
        console.error("Apple ID Token verification failed:", err);
        return res.status(401).json({ message: "Invalid Apple token." });
      }
    } else {
      return res.status(400).json({ message: "Unsupported provider." });
    }

    // Fetch the user
    let user = await User.findOne({ email: userInfo.email });

    if (!user) {
      // ✅ Create new user with deviceToken
      user = await User.create({
        email: userInfo.email,
        name: userInfo.name,
        provider,
        isVerified: true,
        isSocial: true,
        role,
        platform,
        deviceToken, // ✅ save on creation
        [`${provider}Id`]: userInfo.providerId,
      });
    } else {
      // ✅ Update missing fields
      let shouldSave = false;

      if (!user[`${provider}Id`]) {
        user[`${provider}Id`] = userInfo.providerId;
        user.provider = provider;
        shouldSave = true;
      }
      if (!user.role) {
        user.role = role;
        shouldSave = true;
      }
      if (!user.platform) {
        user.platform = platform;
        shouldSave = true;
      }
      if (!user.isSocial) {
        user.isSocial = true;
        shouldSave = true;
      }

      // ✅ Update deviceToken if changed
      if (deviceToken && deviceToken !== user.deviceToken) {
        user.deviceToken = deviceToken;
        shouldSave = true;
      }

      if (shouldSave) await user.save();
    }

    const profile = await Profile.findOne({ user: user._id });
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    const userObject = user.toObject();
    userObject.profile = profile || null;

    if (!profile) {
      return res.status(200).json({
        success: true,
        message: "Account created via social login. Profile setup required.",
        isFirstTime: true,
        accessToken,
        refreshToken,
        user: userObject,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      isFirstTime: false,
      accessToken,
      refreshToken,
      user: userObject,
    });
  } catch (error) {
    console.error("Social login error:", error);
    return res.status(500).json({ message: "Social login failed." });
  }
};

// Set password after OTP verification (for signup flow)
exports.createPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isVerified || user.password) {
      return res.status(403).json({
        message:
          "Invalid request. Either user not found, not verified, or password already set.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.canCreatePassword = false;
    await user.save();

    const accessToken = generateAccessToken(user);
    // const refreshToken = await generateRefreshToken(user);

    res.status(200).json({
      message: "Password set successfully.",
      accessToken,
      // refreshToken,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error("Create password error:", error);
    res.status(500).json({ message: "Server error while setting password." });
  }
};
