import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket: Socket | null = null;

/**
 * Initialize and connect the Socket.IO client if authenticated.
 */
export function connectSocket(): Socket | null {
  if (socket?.connected) return socket;

  const token = localStorage.getItem("authToken");
  if (!token) {
    return null;
  }

  // Connect with token in the auth handshake
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    // Connection established
  });

  socket.on("disconnect", () => {
    // Disconnected from server
  });

  socket.on("error", (err: any) => {
    console.error("🔌 Socket error:", err.message || err);
  });

  // Listen for global user updates (e.g., avatar changed) and update cached user
  socket.on("user_updated", (data: { user: any }) => {
    try {
      if (data?.user) {
        localStorage.setItem("cachedUser", JSON.stringify(data.user));
        window.dispatchEvent(new CustomEvent("user-updated", { detail: data.user }));
      }
    } catch (e) {
      console.error("Failed to handle user_updated socket event:", e);
    }
  });

  return socket;
}

/**
 * Disconnect the Socket.IO client.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Get the active socket instance.
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Join a specific chat room.
 */
export function joinChat(chatId: string): void {
  const currentSocket = connectSocket();
  if (currentSocket) {
    currentSocket.emit("join_chat", { chatId });
  }
}

/**
 * Send a message via Socket.IO.
 */
export function sendSocketMessage(chatId: string, text: string): void {
  const currentSocket = connectSocket();
  if (currentSocket) {
    currentSocket.emit("send_message", { chatId, text });
  }
}

/**
 * Emit a typing state.
 */
export function emitTyping(chatId: string, isTyping: boolean): void {
  const currentSocket = connectSocket();
  if (currentSocket) {
    currentSocket.emit(isTyping ? "typing" : "stop_typing", { chatId });
  }
}

/**
 * Mark messages in a chat as read.
 */
export function markChatRead(chatId: string): void {
  const currentSocket = connectSocket();
  if (currentSocket) {
    currentSocket.emit("mark_read", { chatId });
  }
}

/**
 * Register a listener for new messages.
 */
export function onNewMessage(callback: (data: { message: any }) => void): void {
  const currentSocket = connectSocket() || getSocket();
  if (currentSocket) {
    currentSocket.off("new_message", callback); // prevent duplicate listeners
    currentSocket.on("new_message", callback);
  }
}

/**
 * Unregister a listener for new messages.
 */
export function offNewMessage(callback: (data: { message: any }) => void): void {
  const currentSocket = getSocket();
  if (currentSocket) {
    currentSocket.off("new_message", callback);
  }
}

/**
 * Register a listener for when messages are read.
 */
export function onMessagesRead(callback: (data: { chatId: string; userId: string }) => void): void {
  const currentSocket = connectSocket() || getSocket();
  if (currentSocket) {
    currentSocket.off("messages_read", callback);
    currentSocket.on("messages_read", callback);
  }
}

/**
 * Unregister a listener for when messages are read.
 */
export function offMessagesRead(callback: (data: { chatId: string; userId: string }) => void): void {
  const currentSocket = getSocket();
  if (currentSocket) {
    currentSocket.off("messages_read", callback);
  }
}
