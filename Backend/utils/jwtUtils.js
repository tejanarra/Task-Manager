const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(new Error("Invalid or expired token"));
      } else {
        resolve(decoded);
      }
    });
  });
};

const authenticateToken = async (req, res, next) => {
  const token =
    req.headers["authorization"] && req.headers["authorization"].split(" ")[1];

  if (!token) {
    return res
      .status(403)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = await verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Unauthorized. Invalid or expired token." });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
};
