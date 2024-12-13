const express = require("express");
const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyVerificationCode,
  verifyRegistrationCode,
  resendVerificationEmail,
  sendContactFormEmail,
} = require("../controllers/authController");
const router = express.Router();

router.post("/register", registerUser);
router.post("/resend-verification", resendVerificationEmail);
router.post("/verify-registration", verifyRegistrationCode);

router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.post("/verify-code", verifyVerificationCode);
router.post("/contact", sendContactFormEmail);

module.exports = router;
