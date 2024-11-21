const express = require("express");
const {
  registerUser,
  loginUser,
  verifyToken,
  forgotPassword,
  verifyVerificationCode,
  verifyRegistrationCode
} = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-token", authenticateToken, verifyToken);

router.post("/forgot-password", forgotPassword);
router.post("/verify-code", verifyVerificationCode);
router.post("/verify-registration", verifyRegistrationCode);

module.exports = router;
