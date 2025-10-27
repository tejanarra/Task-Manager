import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import authenticateToken from "../middleware/authMiddleware.js";
import { body } from "express-validator";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png/;
  const ok =
    allowed.test(path.extname(file.originalname).toLowerCase()) &&
    allowed.test(file.mimetype);
  cb(ok ? null : new Error("Only JPEG, JPG, and PNG files are allowed"), ok);
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/**
 * @openapi
 * /api/profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get logged-in user's profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
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
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phoneNumber: { type: string }
 *               dob: { type: string, format: date }
 *               bio: { type: string }
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
    body("firstName").optional().isLength({ min: 1, max: 50 }),
    body("lastName").optional().isLength({ min: 1, max: 50 }),
    body("phoneNumber")
      .optional()
      .matches(/^[0-9\-+()\s]*$/),
    body("dob")
      .optional()
      .isDate()
      .withMessage("Invalid date of birth")
      .custom((value) => {
        if (new Date(value) >= new Date())
          throw new Error("Date of birth must be in the past");
        return true;
      }),
    body("bio").optional().isLength({ max: 500 }),
  ],
  updateProfile
);

export default router;
