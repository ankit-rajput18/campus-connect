import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Protect routes — verifies the JWT sent in the Authorization header.
 * Attaches the full user document to req.user.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized — no token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized — user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired — please sign in again" });
    }
    return res.status(401).json({ message: "Not authorized — invalid token" });
  }
};

/**
 * Optional auth — attaches user if token is present, but doesn't block
 * unauthenticated requests. Used for the public feed (guests can browse).
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    }
  } catch {
    // Silently ignore invalid/expired tokens for optional auth
  }
  next();
};

export { protect, optionalAuth };
