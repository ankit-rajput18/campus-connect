import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { configureCloudinary } from "./src/config/cloudinary.js";
import { initFirebase } from "./src/config/firebase.js";
import initSocket from "./src/socket/socket.js";

const PORT = process.env.PORT || 5000;

// ── Boot sequence ─────────────────────────────────────────────────────────────
const start = async () => {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Configure third-party services
  configureCloudinary();

  try {
    initFirebase();
  } catch (e) {
    console.warn("⚠️ Firebase skipped:", e.message);
  }

  // 3. Create HTTP server from Express app
  const httpServer = createServer(app);

  // 4. Attach Socket.IO to the same HTTP server
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:8080",
        "http://192.168.29.217:8080",
        "http://192.168.29.217:5173",
      ],
      credentials: true,
    },
  });

  // 5. Register Socket.IO event handlers
  initSocket(io);

  // 6. Start listening
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Server running on http://192.168.29.217:${PORT}`);
    console.log(`📡 Socket.IO ready`);
    console.log(`🌍 Server accessible on local network\n`);
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});