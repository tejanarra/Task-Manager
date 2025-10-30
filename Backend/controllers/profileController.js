// Profile Controller
// Handles user profile operations

import User from '../models/User.js';
import { validationResult } from 'express-validator';
import sequelize from '../config/db.js';
import cloudinary from '../config/cloudinary.js';
import {
  validateName,
  isValidPhone,
  validateBio,
} from '../utils/validationUtils.js';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  CLOUDINARY_CONFIG,
} from '../constants/config.js';

const fetchUser = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: {
      exclude: ['password', 'verificationCode', 'verificationCodeExpiration'],
    },
  });
  return user;
};

/**
 * Get user profile
 */
export const getProfile = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await fetchUser(userId);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
    }

    res.status(HTTP_STATUS.OK).json(user);
  } catch (err) {
    console.error('Error fetching profile:', err.message || err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Server error fetching profile',
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  const userId = req.userId;

  // Check express-validator errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ errors: errors.array() });
  }

  const { firstName, lastName, phoneNumber, dob, bio } = req.body;

  // Validate firstName
  if (firstName) {
    const firstNameValidation = validateName(firstName);
    if (!firstNameValidation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: firstNameValidation.error,
      });
    }
  }

  // Validate lastName
  if (lastName) {
    const lastNameValidation = validateName(lastName);
    if (!lastNameValidation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: lastNameValidation.error,
      });
    }
  }

  // Validate phone number
  if (phoneNumber && !isValidPhone(phoneNumber)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Invalid phone number format',
    });
  }

  // Validate bio
  if (bio !== undefined) {
    const bioValidation = validateBio(bio);
    if (!bioValidation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: bioValidation.error,
      });
    }
  }

  const transaction = await sequelize.transaction();

  try {
    const user = await User.findByPk(userId, { transaction });

    if (!user) {
      await transaction.rollback();
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (dob) user.dob = dob;
    if (bio !== undefined) user.bio = bio;

    // Handle avatar upload
    if (req.file) {
      // Validate file size
      if (req.file.size > CLOUDINARY_CONFIG.MAX_FILE_SIZE) {
        await transaction.rollback();
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: `File size must be less than ${CLOUDINARY_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
        });
      }

      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: CLOUDINARY_CONFIG.FOLDER,
        width: CLOUDINARY_CONFIG.TRANSFORMATION.width,
        height: CLOUDINARY_CONFIG.TRANSFORMATION.height,
        crop: CLOUDINARY_CONFIG.TRANSFORMATION.crop,
        quality: CLOUDINARY_CONFIG.TRANSFORMATION.quality,
        fetch_format: CLOUDINARY_CONFIG.TRANSFORMATION.fetch_format,
      });

      user.avatar = result.secure_url;
    }

    await user.save({ transaction });

    await transaction.commit();

    const updatedUser = await fetchUser(userId);

    res.status(HTTP_STATUS.OK).json({
      message: SUCCESS_MESSAGES.PROFILE_UPDATE_SUCCESS,
      user: updatedUser,
    });
  } catch (err) {
    await transaction.rollback();
    console.error('Error updating profile:', err.message || err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Server error updating profile',
    });
  }
};
