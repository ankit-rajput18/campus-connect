import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { admin } from "../config/firebase.js";
import User from "../models/User.js";

// ── Helper: sign a JWT ────────────────────────────────────────────────────────
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── Helper: send token response ───────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Strip sensitive fields
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
      backgroundImage: user.backgroundImage,
    onboardingComplete: user.onboardingComplete,
    authProvider: user.authProvider,
    createdAt: user.createdAt,
  };

  res.status(statusCode).json({ token, user: userData });
};

// ── POST /api/auth/register ───────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      authProvider: "email",
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Explicitly select password (it's excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({
        message: "This account uses Google Sign-In. Please sign in with Google.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ── POST /api/auth/google ─────────────────────────────────────────────────────
// Frontend sends the Firebase ID token after Google sign-in.
// We verify it with Firebase Admin, then find-or-create the user in MongoDB.
export const googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Firebase ID token is required" });
    }

    // Verify the token with Firebase Admin SDK
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;

    // Find existing user by Firebase UID or email
    let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email: email?.toLowerCase() }] });

    if (!user) {
      // First-time Google sign-in — create the user
      user = await User.create({
        name: name || "Campus Student",
        email: email?.toLowerCase(),
        firebaseUid: uid,
        avatar: picture || "",
        authProvider: "google",
        onboardingComplete: false,
      });
    } else {
      let shouldSave = false;

      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        shouldSave = true;
      }

      if (user.authProvider !== "google") {
        user.authProvider = "google";
        shouldSave = true;
      }

      if (name && name !== user.name) {
        user.name = name;
        shouldSave = true;
      }

      // Preserve custom uploaded avatars after the user signs in again.
      // Only update the avatar from Google if the user has not already saved a manual avatar.
      if (picture && !user.avatarPublicId && picture !== user.avatar) {
        user.avatar = picture;
        shouldSave = true;
      }

      if (shouldSave) {
        await user.save();
      }
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Google sign-in error:", error);
    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({ message: "Google token expired — please sign in again" });
    }
    res.status(500).json({ message: "Google sign-in failed" });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    // Re-fetch from DB to always return the latest avatar/profile data
    const user = await User.findById(req.user._id).select("-password -firebaseUid");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
// JWT is stateless — logout is handled client-side by deleting the token.
// This endpoint exists for completeness / future refresh-token blacklisting.
export const logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};
