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
  googleLogin,
} = require("../controllers/authController");
const { executeCron } = require("../utils/cronJobs");
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
router.get("/cronrun", async (req, res) => {
  try {
    console.log("🔄 Manually triggering cron job via API...");
    await executeCron();
    return res.status(200).json({ message: "Cron job executed successfully!" });
  } catch (error) {
    console.error("🚨 Error triggering cron job:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/google", googleLogin);


module.exports = router;
