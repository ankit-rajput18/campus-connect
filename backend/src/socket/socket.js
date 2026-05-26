import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

/**
 * Socket.IO setup for real-time chat.
 *
 * Flow:
 *  1. Client connects with a JWT in the auth handshake.
 *  2. Server verifies the JWT and stores userId on the socket.
 *  3. Client joins a room named after their userId (for direct delivery).
 *  4. When a message is sent, it's saved to MongoDB and emitted to both
 *     the sender and the recipient's rooms.
 *
 * Events (client → server):
 *   join_chat   { chatId }              — join a specific chat room
 *   send_message { chatId, text }       — send a message
 *   typing       { chatId }             — user is typing
 *   stop_typing  { chatId }             — user stopped typing
 *   mark_read    { chatId }             — mark messages as read
 *
 * Events (server → client):
 *   new_message  { message }            — a new message arrived
 *   user_typing  { chatId, userId }     — someone is typing
 *   user_stop_typing { chatId, userId } — someone stopped typing
 *   messages_read { chatId, userId }    — messages were read
 *   error        { message }            — something went wrong
 */
let globalIo = null;

const initSocket = (io) => {
  globalIo = io;
  // ── Auth middleware ──────────────────────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication error — no token"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error("Authentication error — invalid token"));
    }
  });

  // ── Connection ───────────────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (user: ${socket.userId})`);

    // Each user joins a personal room so we can target them directly
    socket.join(socket.userId);

    // ── join_chat ──────────────────────────────────────────────────────────────
    socket.on("join_chat", ({ chatId }) => {
      socket.join(chatId);
      console.log(`   ↳ User ${socket.userId} joined chat room ${chatId}`);
    });

    // ── send_message ───────────────────────────────────────────────────────────
    socket.on("send_message", async ({ chatId, text }) => {
      try {
        if (!text?.trim()) return;

        // Verify the user is a participant
        const chat = await Chat.findOne({
          _id: chatId,
          participants: socket.userId,
        });

        if (!chat) {
          return socket.emit("error", { message: "Chat not found or access denied" });
        }

        // Save message to DB
        const message = await Message.create({
          chat: chatId,
          sender: socket.userId,
          text: text.trim(),
        });

        const populated = await message.populate("sender", "name avatar");

        // Update chat metadata
        const otherUserId = chat.participants.find(
          (p) => p.toString() !== socket.userId
        );

        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: text.trim(),
          lastMessageAt: new Date(),
          $inc: { [`unreadCounts.${otherUserId}`]: 1 },
        });

        // Emit to everyone in the chat room (sender + recipient if online)
        io.to(chatId).emit("new_message", { message: populated });

        // Also emit to the recipient's personal room (in case they're not in the chat room)
        io.to(otherUserId.toString()).emit("new_message", { message: populated });
      } catch (error) {
        console.error("Socket send_message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ── typing indicators ──────────────────────────────────────────────────────
    socket.on("typing", ({ chatId }) => {
      socket.to(chatId).emit("user_typing", { chatId, userId: socket.userId });
    });

    socket.on("stop_typing", ({ chatId }) => {
      socket.to(chatId).emit("user_stop_typing", { chatId, userId: socket.userId });
    });

    // ── mark_read ──────────────────────────────────────────────────────────────
    socket.on("mark_read", async ({ chatId }) => {
      try {
        await Message.updateMany(
          { chat: chatId, sender: { $ne: socket.userId }, read: false },
          { read: true }
        );

        await Chat.findByIdAndUpdate(chatId, {
          $set: { [`unreadCounts.${socket.userId}`]: 0 },
        });

        // Notify the other participant that their messages were read
        socket.to(chatId).emit("messages_read", { chatId, userId: socket.userId });
      } catch (error) {
        console.error("Socket mark_read error:", error);
      }
    });

    // ── disconnect ─────────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id} (user: ${socket.userId})`);
    });
  });
};

export function getIo() {
  return globalIo;
}

export default initSocket;
