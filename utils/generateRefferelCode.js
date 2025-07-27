// Generate a 6-digit numeric referral code
exports.generateReferralCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


