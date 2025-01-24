const express = require("express");
const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyVerificationCode,
  verifyRegistrationCode,
  resendVerificationEmail,
  sendContactFormEmail,
  changePassword,
} = require("../controllers/authController");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/resend-verification", resendVerificationEmail);
router.post("/verify-registration", verifyRegistrationCode);

router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.post("/verify-code", verifyVerificationCode);
router.post("/contact", sendContactFormEmail);
router.post("/change-password", authenticateToken, changePassword);

module.exports = router;
