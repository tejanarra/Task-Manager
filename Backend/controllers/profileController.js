import { validationResult } from "express-validator";
import prisma from "../utils/prismaClient.js";
import cloudinary from "../config/cloudinary.js";

const fetchUser = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatar: true,
      phoneNumber: true,
      dob: true,
      bio: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getProfile = async (req, res) => {
  try {
    const user = await fetchUser(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.status(200).json(user);
  } catch (err) {
    console.error("Fetch Profile Error:", err);
    return res.status(500).json({ error: "Server error fetching profile" });
  }
};

export const updateProfile = async (req, res) => {
  const errorsFound = validationResult(req);
  if (!errorsFound.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errorsFound.array(),
    });
  }

  const { firstName, lastName, phoneNumber, dob, bio } = req.body;
  const userId = req.userId;

  const normalizedDob = dob ? dob.split("T")[0] : undefined;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const hasUpdates =
      firstName ||
      lastName ||
      phoneNumber !== undefined ||
      dob ||
      bio !== undefined ||
      req.file;

    if (!hasUpdates) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    const updateData = {};

    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (dob) updateData.dob = normalizedDob;
    if (bio !== undefined) updateData.bio = bio.trim();

    if (req.file) {
      const dataUri = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;

      if (existingUser.avatar?.includes("cloudinary")) {
        const publicId = existingUser.avatar.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`avatars/${publicId}`);
      }

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "avatars",
        width: 500,
        height: 500,
        crop: "fill",
        quality: "auto",
        fetch_format: "auto",
      });

      updateData.avatar = result.secure_url;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const updatedUser = await fetchUser(userId);

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Profile Update Error:", err);
    return res.status(500).json({ error: "Server error updating profile" });
  }
};

export default {
  getProfile,
  updateProfile,
};
