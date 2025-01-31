const User = require("../models/User");
const { validationResult } = require("express-validator");
const sequelize = require("../config/db");
const cloudinary = require("../config/cloudinary");

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

  const { firstName, lastName, phoneNumber, dob, bio } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const user = await User.findByPk(userId, { transaction });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (dob) user.dob = dob;
    if (bio !== undefined) user.bio = bio;

    if (req.file) {
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'avatars',
        width: 500,
        height: 500,
        crop: 'fill',
        quality: 'auto',
        fetch_format: 'auto',
      });

      user.avatar = result.secure_url;
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
