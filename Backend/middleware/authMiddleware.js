import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../utils/prismaClient.js";
dotenv.config();

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({
        code: "AUTH_NO_TOKEN",
        message: "Authorization token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user still exists in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true },
    });

    if (!user) {
      return res.status(401).json({
        code: "AUTH_INVALID_USER",
        message: "User no longer exists",
      });
    }

    req.user = decoded;
    req.userId = decoded.userId;

    return next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(403).json({
      code: "AUTH_INVALID_TOKEN",
      message: "Invalid or expired token",
    });
  }
};

export default authenticateToken;
