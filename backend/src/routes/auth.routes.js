import { Router } from "express";
import { register, login, googleSignIn, getMe, logout } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleSignIn);
router.post("/logout", logout);

// Protected routes
router.get("/me", protect, getMe);

export default router;
