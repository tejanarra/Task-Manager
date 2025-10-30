// Profile Routes
// Handles all profile-related endpoints

import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import authenticateToken from '../middleware/authMiddleware.js';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { CLOUDINARY_CONFIG, VALIDATION_CONFIG } from '../constants/config.js';

const router = express.Router();

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = new RegExp(CLOUDINARY_CONFIG.ALLOWED_FORMATS.join('|'));
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase().replace('.', ''));
  const mime = allowedTypes.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error(`Only ${CLOUDINARY_CONFIG.ALLOWED_FORMATS.join(', ')} files are allowed`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: CLOUDINARY_CONFIG.MAX_FILE_SIZE },
});

/**
 * @openapi
 * /api/profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get logged-in user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.get('/', authenticateToken, getProfile);

/**
 * @openapi
 * /api/profile:
 *   put:
 *     tags: [Profile]
 *     summary: Update profile details and optional avatar
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 'Profile updated successfully' }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.put(
  '/',
  authenticateToken,
  upload.single('avatar'),
  [
    body('firstName')
      .optional()
      .isLength({ min: VALIDATION_CONFIG.NAME_MIN_LENGTH, max: VALIDATION_CONFIG.NAME_MAX_LENGTH })
      .withMessage(`First name must be between ${VALIDATION_CONFIG.NAME_MIN_LENGTH} and ${VALIDATION_CONFIG.NAME_MAX_LENGTH} characters`),
    body('lastName')
      .optional()
      .isLength({ min: VALIDATION_CONFIG.NAME_MIN_LENGTH, max: VALIDATION_CONFIG.NAME_MAX_LENGTH })
      .withMessage(`Last name must be between ${VALIDATION_CONFIG.NAME_MIN_LENGTH} and ${VALIDATION_CONFIG.NAME_MAX_LENGTH} characters`),
    body('phoneNumber')
      .optional()
      .matches(VALIDATION_CONFIG.PHONE_REGEX)
      .withMessage('Invalid phone number format'),
    body('dob')
      .optional()
      .isDate()
      .withMessage('Invalid date of birth')
      .custom((value) => {
        if (new Date(value) >= new Date()) {
          throw new Error('Date of birth must be in the past');
        }
        return true;
      }),
    body('bio')
      .optional()
      .isLength({ max: VALIDATION_CONFIG.BIO_MAX_LENGTH })
      .withMessage(`Bio cannot exceed ${VALIDATION_CONFIG.BIO_MAX_LENGTH} characters`),
  ],
  updateProfile
);

export default router;
