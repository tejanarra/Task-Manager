const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { Op } = require("sequelize");
const dotenv = require("dotenv");
import "pg"

dotenv.config();

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { username }] },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const user = await User.create({ username, email, password });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    res.status(201).json({
      token,
      userInfo: { username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Error during registration:", err.message || err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "email and password are required." });
  }

  try {
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    res.status(200).json({
      token,
      userInfo: { username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyToken = async (req, res) => {
  res.status(200).json({ message: "Valid Token" });
};

module.exports = { registerUser, loginUser, verifyToken };
