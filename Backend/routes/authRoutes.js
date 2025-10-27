import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  verifyVerificationCode,
  verifyRegistrationCode,
  resendVerificationEmail,
  sendContactFormEmail,
  changePassword,
  googleLogin,
} from "../controllers/authController.js";
import { executeCron } from "../utils/cronJobs.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RegisterRequest' }
 *     responses:
 *       200:
 *         description: Verification code sent
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MessageResponse' }
 *       400:
 *         description: Missing or invalid fields
 */
router.post("/register", registerUser);

/**
 * @openapi
 * /api/auth/resend-verification:
 *   post:
 *     tags: [Auth]
 *     summary: Resend email verification code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ResendVerificationRequest' }
 *     responses:
 *       200:
 *         description: Verification resent
 */
router.post("/resend-verification", resendVerificationEmail);

/**
 * @openapi
 * /api/auth/verify-registration:
 *   post:
 *     tags: [Auth]
 *     summary: Verify registration code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/VerifyRegistrationRequest' }
 *     responses:
 *       200:
 *         description: Registration verified
 *       400:
 *         description: Invalid or expired code
 */
router.post("/verify-registration", verifyRegistrationCode);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginRequest' }
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials or unverified user
 */
router.post("/login", loginUser);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Send password reset verification code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ForgotPasswordRequest' }
 *     responses:
 *       200:
 *         description: Verification code sent
 */
router.post("/forgot-password", forgotPassword);

/**
 * @openapi
 * /api/auth/verify-code:
 *   post:
 *     tags: [Auth]
 *     summary: Verify the reset code and set a new password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/VerifyCodeResetRequest' }
 *     responses:
 *       200:
 *         description: Password successfully reset
 */
router.post("/verify-code", verifyVerificationCode);

/**
 * @openapi
 * /api/auth/contact:
 *   post:
 *     tags: [Auth]
 *     summary: Send a contact form email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ContactRequest' }
 *     responses:
 *       200:
 *         description: Message sent successfully
 */
router.post("/contact", sendContactFormEmail);

/**
 * @openapi
 * /api/auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password for the logged-in user
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ChangePasswordRequest' }
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: No token provided / unauthorized
 *       403:
 *         description: Invalid or expired token
 */
router.post("/change-password", authenticateToken, changePassword);

/**
 * @openapi
 * /api/auth/cronrun:
 *   get:
 *     tags: [Auth]
 *     summary: Manually trigger cron job (internal tool)
 *     responses:
 *       200:
 *         description: Cron executed successfully
 */
router.get("/cronrun", async (req, res) => {
  try {
    console.log("running cron...");
    await executeCron();
    res.status(200).json({ message: "Cron job executed successfully!" });
  } catch (error) {
    console.error("Cron error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @openapi
 * /api/auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Login with Google OAuth code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/GoogleLoginRequest' }
 *     responses:
 *       200:
 *         description: Google login successful
 */
router.post("/google", googleLogin);

export default router;
