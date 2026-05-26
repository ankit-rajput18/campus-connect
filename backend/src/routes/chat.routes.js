import { Router } from "express";
import {
  getChats,
  findOrCreateChat,
  getMessages,
  sendMessage,
} from "../controllers/chat.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// All chat routes require authentication
router.use(protect);

router.get("/", getChats);                                  // GET  /api/chats
router.post("/", findOrCreateChat);                         // POST /api/chats
router.get("/:chatId/messages", getMessages);               // GET  /api/chats/:chatId/messages
router.post("/:chatId/messages", sendMessage);              // POST /api/chats/:chatId/messages

export default router;
