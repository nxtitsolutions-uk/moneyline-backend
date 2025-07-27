const { v4: uuidv4 } = require("uuid");
const User = require("../models/userModel");
const Invitation = require("../models/invitationModel");
const { sendInvitationEmail } = require("../services/emailService");
const Profile = require("../models/profileModel");
const {generateReferralCode} = require("../utils/generateRefferelCode");


// ✅ Generate referral link & send invitation email
exports.sendInvitation = async (req, res) => {
  try {
    const { email } = req.body;
    const invitedBy = req.user._id;
    const token = generateReferralCode();

    // Referral URL as per frontend flow
    const referralUrl = `${process.env.FRONTEND_URL}/signup?ref=${token}`;

    // ✅ Save invitation in DB
    const invitation = await Invitation.create({
      token,
      invitedBy,
      email: email || undefined,
    });

    // ✅ Get inviter's name
    const userProfile = await Profile.findOne({ user: invitedBy });
    const inviterName = userProfile
      ? `${userProfile.firstName} ${userProfile.lastName}`
      : "A Moneyline User";

    // ✅ If email is provided → send invitation email
    if (email) {
      await sendInvitationEmail(email, referralUrl, inviterName, token);
      return res.status(200).json({
        message: "Invitation email sent successfully.",
        referralUrl,
      });
    }

    // ✅ If no email → return referral link
    return res.status(200).json({
      message: "Referral link generated successfully.",
      token,
      referralUrl,
    });
  } catch (error) {
    console.error("Invitation Error:", error);
    res.status(500).json({ message: "Failed to create invitation." });
  }
};

// ✅ Accept Invitation (when user clicks referral link)
exports.acceptInvitation = async (req, res) => {
  try {
    const { token } = req.query;

    const invite = await Invitation.findOne({ token });
    if (!invite) {
      return res.status(404).json({ message: "Invalid or expired referral link." });
    }

    if (invite.accepted) {
      return res.status(400).json({ message: "Referral already used." });
    }

    // ⚠️ Do not mark as accepted yet → Accept only after signup verification
    return res.status(200).json({
      message: "Referral token is valid. Continue with signup.",
      referralToken: invite.token,
      inviter: invite.invitedBy,
    });
  } catch (err) {
    console.error("Accept Invitation Error:", err);
    res.status(500).json({ message: "Server error while validating referral link." });
  }
};

// ✅ Mark invitation as accepted (called after OTP verification)
exports.applyReferralToUser = async (userId, referralToken) => {
  try {
    const invite = await Invitation.findOne({ token: referralToken });
    if (!invite || invite.accepted) return;

    invite.accepted = true;
    invite.acceptedAt = new Date();
    invite.acceptedUserId = userId;
    await invite.save();
  } catch (err) {
    console.error("Apply Referral Error:", err);
  }
};

// ✅ Get all invitations created by the logged-in user
exports.getMyInvitations = async (req, res) => {
  try {
    const invites = await Invitation.find({ invitedBy: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      invitations: invites.map((inv) => ({
        token: inv.token,
        referralUrl: `${process.env.FRONTEND_URL}/signup?ref=${inv.token}`,
        email: inv.email || null,
        accepted: inv.accepted,
        acceptedAt: inv.acceptedAt || null,
        createdAt: inv.createdAt,
      })),
    });
  } catch (err) {
    console.error("Get Invitations Error:", err);
    res.status(500).json({ message: "Failed to fetch invitations." });
  }
};
