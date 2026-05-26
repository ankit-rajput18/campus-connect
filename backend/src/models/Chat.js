import mongoose from "mongoose";

/**
 * A Chat is a 1-to-1 thread between two users.
 * We store the last message inline for fast sidebar rendering
 * (avoids an extra Message lookup per thread).
 */
const chatSchema = new mongoose.Schema(
  {
    // The two participants — always exactly two
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // Denormalized last message for sidebar preview
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    // Unread counts per participant: { userId: count }
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

// Ensure we never create duplicate threads for the same pair
chatSchema.index({ participants: 1 });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
