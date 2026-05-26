import { Router } from "express";
import {
  getPosts,
  getMyPosts,
  getPostById,
  createPost,
  updatePost,
  updatePostStatus,
  deletePost,
  toggleInterest,
  respondToRequest,
  getNotifications,
} from "../controllers/post.controller.js";
import { protect, optionalAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Public (guests can browse the feed)
router.get("/", optionalAuth, getPosts);          // GET  /api/posts

// Protected — must be before /:id to avoid wildcard match
router.get("/user/my", protect, getMyPosts);                              // GET  /api/posts/user/my
router.get("/user/notifications", protect, getNotifications);             // GET  /api/posts/user/notifications

router.get("/:id", optionalAuth, getPostById);    // GET  /api/posts/:id
router.post("/", protect, upload.single("image"), createPost);            // POST /api/posts
router.put("/:id", protect, upload.single("image"), updatePost);          // PUT  /api/posts/:id
router.patch("/:id/status", protect, updatePostStatus);                   // PATCH /api/posts/:id/status
router.delete("/:id", protect, deletePost);                               // DELETE /api/posts/:id
router.post("/:id/interest", protect, toggleInterest);                    // POST /api/posts/:id/interest
router.post("/:postId/requests/:requestId/respond", protect, respondToRequest); // POST /api/posts/:postId/requests/:requestId/respond

export default router;
