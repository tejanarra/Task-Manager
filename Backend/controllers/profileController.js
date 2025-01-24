const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const sequelize = require("../config/db");
import "pg";

const fetchUser = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: {
      exclude: ["password", "verificationCode", "verificationCodeExpiration"],
    },
  });
  return user;
};

const getProfile = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await fetchUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching profile:", err.message || err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.userId;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    dob,
    bio,
    password,
    currentPassword,
  } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const user = await User.findByPk(userId, { transaction });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (dob) user.dob = dob;
    if (bio !== undefined) user.bio = bio;

    if (password) {
      if (!currentPassword) {
        await transaction.rollback();
        return res
          .status(400)
          .json({
            message: "Current password is required to set a new password",
          });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      user.password = password;
    }

    if (req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    await user.save({ transaction });

    await transaction.commit();

    const updatedUser = await fetchUser(userId);

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Error updating profile:", err.message || err);
    res.status(500).json({ message: "Server error updating profile" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
