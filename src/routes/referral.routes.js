const express = require("express");
const router = express.Router();
const referralCodeController = require("../controllers/referral.controller");
const authenticateToken = require("../middlewares/auth.middleware");

router.post(
  "/generateReferralCode",
  authenticateToken,
  referralCodeController.generateReferralCode
);
router.post(
  "/processReferral",
  authenticateToken,
  referralCodeController.processReferral
);
router.get(
  "/getReferralStats",
  authenticateToken,
  referralCodeController.getReferralStats
);

module.exports = router;
