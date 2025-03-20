// Import required dependencies
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Configuration constants
const MAX_CONNECTIONS_PER_IP = 8;        // Maximum allowed connections per IP
const ROOM_EXPIRY_TIME = 15 * 60 * 1000; // Room expiry time in milliseconds (15 minutes)
const CLEANUP_INTERVAL = 60 * 1000;       // Cleanup interval in milliseconds (1 minute)

// In-memory data structures for tracking users and rooms
const users = new Map();         // Maps socket.id to user data {publicKey, roomId}
const rooms = new Map();         // Maps roomId to Set of connected socket IDs
const pendingRooms = new Map();  // Maps roomId to room creation timestamp
const ipConnectionCount = new Map(); // Maps IP addresses to connection count

// CORS configuration
const corsOptions = {
  // Whitelist of allowed origins
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://privy.abhayyy.tech",
      /localhost:(\d+)/,
      /127\.0\.0\.1:\d+/,
      "https://cron-job.org",
    ];

    // Allow requests with no origin (mobile apps, tools)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin matches allowed patterns
    const isAllowed = allowedOrigins.some((allowed) => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"), false);
    }
  },
  methods: ["GET", "POST"],
  credentials: true,
  maxAge: 86400,
  allowedHeaders: ["Content-Type", "Authorization", "User-Agent"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Initialize Express application
const app = express();
app.set("trust proxy", 1);

// Apply middleware
app.use(cors(corsOptions));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: ROOM_EXPIRY_TIME,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/", apiLimiter);

// Health check endpoint
app.post("/is-alive", (req, res) => {
  const userAgent = req.headers["user-agent"];
  if (userAgent && userAgent.includes("cron-job.org")) {
    return res.status(200).send({ message: "Server Alive!" });
  }
  res.send({ message: "Server Alive!" });
});

// Room creation endpoint
app.post("/api/rooms", (req, res) => {
  const { roomId } = req.body;
  if (!roomId || roomId.length !== 8) {
    return res.status(400).json({ error: "Invalid room ID" });
  }
  pendingRooms.set(roomId, { createdAt: Date.now() });
  res.json({ success: true });
});

// Room existence check endpoint
app.get("/api/rooms/:roomId", (req, res) => {
  const roomId = req.params.roomId;
  const exists = pendingRooms.has(roomId) || rooms.has(roomId);
  res.json({ exists });
});

// CORS error handler
app.use((err, req, res, next) => {
  if (err.message === "CORS not allowed") {
    return res.status(403).json({
      error: "Not allowed by CORS",
      origin: req.headers.origin,
    });
  }
  next(err);
});

// Initialize HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO with configuration
const io = new Server(httpServer, {
  cors: corsOptions,
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
  maxHttpBufferSize: 32 * 1024,
  pingInterval: 10000,
  pingTimeout: 10000,
});

// Socket connection limit middleware
io.use((socket, next) => {
  const clientIp =
    socket.handshake.headers["x-forwarded-for"] || socket.handshake.address;
  const connectionCount = ipConnectionCount.get(clientIp) || 0;

  if (connectionCount >= MAX_CONNECTIONS_PER_IP) {
    return next(new Error("Connection limit exceeded"));
  }

  ipConnectionCount.set(clientIp, connectionCount + 1);
  socket.on("disconnect", () => {
    ipConnectionCount.set(clientIp, (ipConnectionCount.get(clientIp) || 1) - 1);
  });
  next();
});

// Handle user disconnection
function handleDisconnect(socketId) {
  const userData = users.get(socketId);
  if (!userData) return;

  if (rooms.has(userData.roomId)) {
    const room = rooms.get(userData.roomId);
    room.delete(socketId);

    if (room.size === 0) {
      rooms.delete(userData.roomId);
    } else {
      io.to(userData.roomId).emit("peer disconnected", {
        peerKey: userData.publicKey,
      });
    }
  }
  users.delete(socketId);
}

// Socket.IO connection handler
io.on("connection", (socket) => {
  // Handle user registration in a room
  socket.on("register", (data) => {
    try {
      if (!data?.publicKey?.trim() || !data?.roomId?.trim()) {
        throw new Error("Invalid registration data");
      }

      const { publicKey, roomId } = data;
      if (users.has(socket.id)) handleDisconnect(socket.id);

      // Check room capacity
      const room = io.sockets.adapter.rooms.get(roomId);
      if (room?.size >= 2) {
        return socket.emit("room_full");
      }

      // Register user in room
      pendingRooms.delete(roomId);
      users.set(socket.id, { publicKey, roomId });
      socket.join(roomId);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set([socket.id]));
      } else {
        rooms.get(roomId).add(socket.id);
      }

      // Notify peers if room has multiple users
      if (rooms.get(roomId).size > 1) {
        const otherMembers = Array.from(rooms.get(roomId))
          .filter((id) => id !== socket.id)
          .map((id) => users.get(id).publicKey);

        socket.emit("peers list", { peers: otherMembers });
        socket
          .to(roomId)
          .emit("peer connected", { peerKey: publicKey, socketId: socket.id });
      }
    } catch (error) {
      socket.emit("error", {
        code: "INVALID_REGISTRATION",
        message: error.message,
      });
    }
  });

  // Handle room messages
  socket.on("room message", (data, ack) => {
    try {
      const userData = users.get(socket.id);
      if (!userData) throw new Error("User not registered");

      const timestamp = Date.now();
      const messageId = `${socket.id}-${timestamp}`;

      socket.to(userData.roomId).emit("room message", {
        id: messageId,
        from: userData.publicKey,
        message: data.message,
        timestamp,
      });

      if (typeof ack === "function") {
        ack({ status: "delivered", messageId });
      }
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => handleDisconnect(socket.id));
});

// Periodic cleanup of expired rooms
setInterval(() => {
  const now = Date.now();
  pendingRooms.forEach((value, key) => {
    if (now - value.createdAt > ROOM_EXPIRY_TIME) {
      pendingRooms.delete(key);
    }
  });
}, CLEANUP_INTERVAL);

// Start server
httpServer.listen(5000, () => console.log("Server running on port 5000"));
