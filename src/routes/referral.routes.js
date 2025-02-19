const express = require("express");
const router = express.Router();
const referralCodeController = require("../controllers/referral.controller");

router.post(
  "/generateReferralCode",
  referralCodeController.generateReferralCode
);

router.post("/processReferral", referralCodeController.processReferral);

router.get("/getReferralStats", referralCodeController.getReferralStats);

module.exports = router;
