const { prisma } = require("../config/database");
const { v4: uuidv4 } = require("uuid");

exports.createReferralCode = async (userId) => {
  const code = uuidv4().split("-")[0]; // Generate 8-character unique code

  const newReferralCode = await prisma.referralCode.create({
    data: {
      referrer_id: userId,
      code: code,
      max_uses: 10,
      points_per_referral: 100,
      expires_at: new Date(new Date().setDate(new Date().getDate() + 30)), // 30-day expiry
    },
  });

  return {
    code: newReferralCode.code,
    expiresAt: newReferralCode.expires_at,
  };
};
