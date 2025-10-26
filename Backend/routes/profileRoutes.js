const express = require("express");
const { getProfile, updateProfile } = require("../controllers/profileController");
const authenticateToken = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, JPG, and PNG files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
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
router.get("/", authenticateToken, getProfile);

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
  "/",
  authenticateToken,
  upload.single("avatar"),
  [
    body("firstName")
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage("First name must be between 1 and 50 characters"),
    body("lastName")
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage("Last name must be between 1 and 50 characters"),
    body("phoneNumber")
      .optional()
      .matches(/^[0-9\-+()\s]*$/)
      .withMessage("Invalid phone number format"),
    body("dob")
      .optional()
      .isDate()
      .withMessage("Invalid date of birth")
      .custom((value) => {
        if (new Date(value) >= new Date()) {
          throw new Error("Date of birth must be in the past");
        }
        return true;
      }),
    body("bio")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Bio cannot exceed 500 characters"),
  ],
  updateProfile
);

module.exports = router;
