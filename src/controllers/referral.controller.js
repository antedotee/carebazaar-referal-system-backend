const { prisma } = require("../config/database");
const referralCodeService = require("../services/referral.services");

exports.generateReferralCode = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const referralCode = await referralCodeService.createReferralCode(userId);
    res.status(201).json(referralCode);
  } catch (error) {
    console.error("Error generating referral code:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.processReferral = async (req, res) => {
  try {
    const { referralCode, newUserEmail, newUserName } = req.body;

    // Start transaction
    await prisma.$transaction(async (prisma) => {
      // Verify referral code
      const code = await prisma.referralCode.findFirst({
        where: {
          code: referralCode,
          times_used: { lt: prisma.referralCode.max_uses },
          expires_at: { gt: new Date() },
        },
      });

      if (!code) {
        return res
          .status(400)
          .json({ error: "Invalid or expired referral code" });
      }

      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email: newUserEmail,
          name: newUserName,
        },
      });

      // Record referral
      await prisma.referral.create({
        data: {
          referrer_id: code.referrer_id,
          referred_id: newUser.user_id,
          code_id: code.code_id,
          points_awarded: code.points_per_referral,
          status: "completed",
        },
      });

      // Update referral code usage
      await prisma.referralCode.update({
        where: { code_id: code.code_id },
        data: { times_used: { increment: 1 } },
      });

      // Award points to referrer
      await prisma.user.update({
        where: { user_id: code.referrer_id },
        data: { points: { increment: code.points_per_referral } },
      });

      res.status(200).json({ message: "Referral processed successfully" });
    });
  } catch (error) {
    console.error("Error processing referral:", error);
    res.status(500).json({ error: "Error processing referral" });
  }
};

exports.getReferralStats = async (req, res) => {
  try {
    const userId = parseInt(req.query.userId);

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        points: true,
        referrals: {
          select: {
            referral_id: true,
            status: true,
            created_at: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const totalReferrals = user.referrals.length;
    const successfulReferrals = user.referrals.filter(
      (referral) => referral.status === "completed"
    ).length;
    const recentReferrals = user.referrals.filter((referral) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return referral.created_at > thirtyDaysAgo;
    }).length;

    res.status(200).json({
      total_points: user.points,
      total_referrals: totalReferrals,
      successful_referrals: successfulReferrals,
      recent_referrals: recentReferrals,
    });
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    res.status(500).json({ error: "Error fetching referral stats" });
  }
};
