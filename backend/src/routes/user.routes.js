import { Router } from "express";
import {
  onboardUser,
  getUserById,
  updateProfile,
  getMyProfile,
  getUserCount,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Public count endpoint for the college landing page
router.get("/count", getUserCount);                            // GET  /api/users/count

// All user routes require authentication
router.use(protect);

router.get("/profile", getMyProfile);                          // GET  /api/users/profile
router.put("/profile", upload.any(), updateProfile); // PUT  /api/users/profile
router.put("/onboard", upload.any(), onboardUser);  // PUT  /api/users/onboard
router.get("/:id", getUserById);                               // GET  /api/users/:id

export default router;
