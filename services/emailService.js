const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Or SES, SendGrid, etc.
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ✅ Generic Email Sender
const sendEmail = async (to, subject, html) => {
  return transporter.sendMail({
    from: `"Moneyline" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
};

// ✅ Send OTP Email (Already implemented earlier)
exports.sendOtpEmail = async (email, otp, type = "signup") => {
  const subjectMap = {
    signup: "Verify Your Email – Moneyline",
    forgotPassword: "Reset Your Password – Moneyline",
    accountDeletion: "Account Deletion Request – Moneyline",
  };

  const messageMap = {
    signup: `Use the OTP below to verify your Moneyline account.`,
    forgotPassword: `Use the OTP below to reset your Moneyline password.`,
    accountDeletion: `Use the OTP below to confirm account deletion.`,
  };

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
      <h2 style="text-align: center; color: #2c3e50;">${subjectMap[type]}</h2>
      <p style="font-size: 16px; color: #555;">${messageMap[type]}</p>
      <div style="text-align: center; margin: 20px 0;">
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #1a73e8;">${otp}</p>
      </div>
      <p style="font-size: 14px; color: #777;">This OTP is valid for <strong>10 minutes</strong>.</p>
      <p style="font-size: 12px; color: #aaa;">© ${new Date().getFullYear()} Moneyline. All rights reserved.</p>
    </div>
  `;

  await sendEmail(email, subjectMap[type], htmlTemplate);
};

// ✅ NEW: Send Invitation Email
exports.sendInvitationEmail = async (email, referralUrl, inviterName, referralCode) => {
  const subject = "You're Invited to Join Moneyline!";

  const appStoreUrl = "https://apps.apple.com/app/moneyline"; // Replace with actual link
  const playStoreUrl = "https://play.google.com/store/apps/details?id=moneyline"; // Replace with actual link

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
      <h2 style="text-align: center; color: #2c3e50;">Join Moneyline Today!</h2>

      <p style="font-size: 16px; color: #444;">Hi there,</p>
      <p style="font-size: 16px; color: #444;">
        <strong>${inviterName}</strong> has invited you to join <strong>Moneyline</strong>.
      </p>

      <div style="text-align: center; margin: 20px 0;">
        <p style="font-size: 16px; color: #333;">Your referral code:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #1a73e8;">${referralCode}</p>
      </div>

      <p style="font-size: 15px; color: #555;">Use this code during signup or click below to join directly:</p>
      <div style="text-align: center; margin: 20px;">
        <a href="${referralUrl}" style="background: #1a73e8; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">Join Now</a>
      </div>

      <p style="text-align: center; font-size: 16px; margin: 20px 0; color: #555;">Download the app:</p>

      <div style="text-align: center;">
        <a href="${appStoreUrl}" style="margin-right: 10px;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Download_on_the_App_Store_Badge.svg" height="40" />
        </a>
        <a href="${playStoreUrl}">
          <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" height="40" />
        </a>
      </div>

      <p style="font-size: 12px; text-align: center; margin-top: 25px; color: #999;">
        © ${new Date().getFullYear()} Moneyline. All rights reserved.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Moneyline" <${process.env.MAIL_USER}>`,
    to: email,
    subject,
    html: htmlTemplate,
  });
};
