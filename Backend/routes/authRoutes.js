// Authentication Routes
// Handles all auth-related endpoints

import express from 'express';
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
} from '../controllers/authController.js';
import authenticateToken from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @openapi
 * /api/auth/cronrun:
 *   get:
 *     tags: [Auth]
 *     summary: Trigger reminder email cron job (called by external cron service)
 *     description: This endpoint is called by cronjob.org every 5 minutes to send reminder emails
 *     parameters:
 *       - in: header
 *         name: x-cron-secret
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional secret key for authentication
 *     responses:
 *       200:
 *         description: Cron executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 remindersSent:
 *                   type: number
 *       401:
 *         description: Unauthorized (invalid secret)
 *       500:
 *         description: Server error
 */
router.get('/cronrun', async (req, res) => {
  try {
    // Optional security: Check for secret key if configured
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const providedSecret = req.headers['x-cron-secret'] || req.query.secret;
      if (providedSecret !== cronSecret) {
        console.warn('⚠️ Unauthorized cron job attempt from:', req.ip);
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }
    }

    const startTime = Date.now();
    console.log('🔄 Cron job triggered via API at', new Date().toISOString());

    // Execute the cron job
    const result = await executeCron();

    const duration = Date.now() - startTime;
    console.log(`✅ Cron job completed in ${duration}ms`);

    return res.status(200).json({
      success: true,
      message: 'Cron job executed successfully',
      timestamp: new Date().toISOString(),
      executionTime: `${duration}ms`,
      remindersSent: result?.count || 0
    });
  } catch (error) {
    console.error('🚨 Error executing cron job:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      timestamp: new Date().toISOString()
    });
  }
});

// Apply rate limiting to all auth routes
router.use(authLimiter);

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
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       200:
 *         description: Verification code sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', registerUser);

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
 *           schema:
 *             $ref: '#/components/schemas/ResendVerificationRequest'
 *     responses:
 *       200:
 *         description: Verification resent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */
router.post('/resend-verification', resendVerificationEmail);

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
 *           schema:
 *             $ref: '#/components/schemas/VerifyRegistrationRequest'
 *     responses:
 *       200:
 *         description: Registration verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid or expired code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/verify-registration', verifyRegistrationCode);

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
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid credentials or unverified user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', loginUser);

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
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Verification code sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerificationSentResponse'
 */
router.post('/forgot-password', forgotPassword);

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
 *           schema:
 *             $ref: '#/components/schemas/VerifyCodeResetRequest'
 *     responses:
 *       200:
 *         description: Password successfully reset
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */
router.post('/verify-code', verifyVerificationCode);

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
 *           schema:
 *             $ref: '#/components/schemas/ContactRequest'
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */

router.post('/contact', sendContactFormEmail);

/**
 * @openapi
 * /api/auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password for the logged-in user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       401:
 *         description: No token provided / unauthorized
 *       403:
 *         description: Invalid or expired token
 */
router.post('/change-password', authenticateToken, changePassword);

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
 *           schema:
 *             $ref: '#/components/schemas/GoogleLoginRequest'
 *     responses:
 *       200:
 *         description: Google login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
router.post('/google', googleLogin);

export default router;
