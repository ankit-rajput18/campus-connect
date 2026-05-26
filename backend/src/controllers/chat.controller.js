import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ── GET /api/chats ─────────────────────────────────────────────────────────────
// Get all chat threads for the logged-in user, sorted by latest message.
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "name avatar department college");

    // Attach unread count for the current user
    const enriched = chats.map((chat) => ({
      ...chat.toObject(),
      unread: chat.unreadCounts?.get(req.user._id.toString()) || 0,
      // The "other" participant (not the current user)
      otherUser: chat.participants.find(
        (p) => p._id.toString() !== req.user._id.toString()
      ),
    }));

    res.status(200).json({ chats: enriched });
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({ message: "Server error fetching chats" });
  }
};

// ── POST /api/chats ────────────────────────────────────────────────────────────
// Find or create a 1-to-1 chat thread between the current user and another user.
export const findOrCreateChat = async (req, res) => {
  try {
    let { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: "recipientId is required" });
    }

    let recipient = null;

    // Check if recipientId is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(recipientId)) {
      recipient = await User.findById(recipientId);
    } else {
      // Fallback: search by name slug (e.g. "sneha-joshi" -> "Sneha Joshi")
      const namePattern = escapeRegex(recipientId.replace(/-/g, " "));
      recipient = await User.findOne({
        name: { $regex: new RegExp(`^${namePattern}$`, "i") },
      });
    }

    if (!recipient) {
      return res.status(404).json({ message: "Recipient user not found" });
    }

    const recipientObjectId = recipient._id;

    if (recipientObjectId.equals(req.user._id)) {
      return res.status(400).json({ message: "Cannot start a chat with yourself" });
    }

    // Check if a thread already exists between these two users
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, recipientObjectId] },
    }).populate("participants", "name avatar department college");

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user._id, recipientObjectId],
        unreadCounts: {},
      });
      chat = await chat.populate("participants", "name avatar department college");
    }


    res.status(200).json({ chat });
  } catch (error) {
    console.error("Find/create chat error:", {
      recipientId: req.body?.recipientId,
      userId: req.user?._id,
      error,
    });
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/chats/:chatId/messages ───────────────────────────────────────────
// Get paginated message history for a chat thread.
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify the user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found or access denied" });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("sender", "name avatar");

    // Mark all messages in this chat as read for the current user
    await Message.updateMany(
      { chat: chatId, sender: { $ne: req.user._id }, read: false },
      { read: true }
    );

    // Reset unread count for this user
    await Chat.findByIdAndUpdate(chatId, {
      $set: { [`unreadCounts.${req.user._id}`]: 0 },
    });

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error fetching messages" });
  }
};

// ── POST /api/chats/:chatId/messages ──────────────────────────────────────────
// Send a message via REST (Socket.IO handles real-time delivery separately).
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found or access denied" });
    }

    const message = await Message.create({
      chat: chatId,
      sender: req.user._id,
      text: text.trim(),
    });

    const populated = await message.populate("sender", "name avatar");

    // Update chat's last message and increment unread for the other participant
    const otherUserId = chat.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: text.trim(),
      lastMessageAt: new Date(),
      $inc: { [`unreadCounts.${otherUserId}`]: 1 },
    });

    res.status(201).json({ message: populated });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error sending message" });
  }
};
