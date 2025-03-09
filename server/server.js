const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors());
app.use(express.json()); // Add this to parse JSON request bodies

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/", apiLimiter);

// Track pending rooms (created but not yet joined)
const pendingRooms = new Map(); // roomId -> { createdAt: timestamp }

// Endpoint to register a new room
app.post("/api/rooms", (req, res) => {
  const { roomId } = req.body;
  if (!roomId || roomId.length !== 8) {
    return res.status(400).json({ error: "Invalid room ID" });
  }

  pendingRooms.set(roomId, { createdAt: Date.now() });
  res.json({ success: true });
});

// Endpoint to check if a room exists
app.get("/api/rooms/:roomId", (req, res) => {
  const roomId = req.params.roomId;
  const exists = pendingRooms.has(roomId) || rooms.has(roomId);
  res.json({ exists });
});

// Cleanup stale pending rooms (e.g., rooms created but never joined)
setInterval(() => {
  const now = Date.now();
  pendingRooms.forEach((value, key) => {
    if (now - value.createdAt > 15 * 60 * 1000) {
      // 15-minute expiration
      pendingRooms.delete(key);
    }
  });
}, 60 * 1000); // Run every minute

const httpServer = createServer(app);

const ipConnectionCount = new Map();
const MAX_CONNECTIONS_PER_IP = 8;

const io = new Server(httpServer, {
  cors: {
    origin: "https://privy.abhayyy.tech/",
    methods: ["GET", "POST"],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
  maxHttpBufferSize: 32 * 1024, // 10 KB
  pingInterval: 10000,
  pingTimeout: 10000,
});

io.use((socket, next) => {
  const clientIp = socket.handshake.headers["x-forwarded-for"] || socket.handshake.address;
  const connectionCount = ipConnectionCount.get(clientIp) || 0;

  if (connectionCount >= MAX_CONNECTIONS_PER_IP) {
    console.warn(`IP ${clientIp} exceeded connection limit`);
    return next(new Error("Connection limit exceeded"));
  }

  ipConnectionCount.set(clientIp, connectionCount + 1);

  socket.on("disconnect", () => {
    ipConnectionCount.set(clientIp, (ipConnectionCount.get(clientIp) || 1) - 1);
  });

  next();
});

const users = new Map(); // socket.id -> { publicKey, roomId }
const rooms = new Map(); // roomId -> Set of socket IDs

io.on("connection", (socket) => {
  socket.on("register", (data) => {
    try {
      if (!data || typeof data !== "object") {
        throw new Error("Invalid registration format");
      }

      const { publicKey, roomId } = data;

      if (!publicKey?.trim() || !roomId?.trim()) {
        throw new Error(`Missing parameters. Received: publicKey=${publicKey}, roomId=${roomId}`);
      }

      if (typeof publicKey !== "string" || typeof roomId !== "string") {
        throw new Error("Parameters must be strings");
      }

      if (users.has(socket.id)) {
        handleDisconnect(socket.id);
      }

      const room = io.sockets.adapter.rooms.get(roomId);
      const roomSize = room ? room.size : 0;

      if (roomSize >= 2) {
        socket.emit("room_full");
        return;
      }

      // Remove from pending rooms (if present)
      if (pendingRooms.has(roomId)) {
        pendingRooms.delete(roomId);
      }

      users.set(socket.id, { publicKey, roomId });
      socket.join(roomId);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set([socket.id]));
      } else {
        rooms.get(roomId).add(socket.id);
      }

      if (rooms.get(roomId).size > 1) {
        const otherMembers = Array.from(rooms.get(roomId))
          .filter((id) => id !== socket.id)
          .map((id) => users.get(id).publicKey);

        socket.emit("peers list", { peers: otherMembers });
        socket.to(roomId).emit("peer connected", {
          peerKey: publicKey,
          socketId: socket.id,
        });
      }
    } catch (error) {
      console.error("Registration error:", error.message);
      socket.emit("error", {
        code: "INVALID_REGISTRATION",
        message: error.message,
        received: data,
      });
    }
  });

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
      console.error("Message error:", error.message);
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("disconnect", () => handleDisconnect(socket.id));
});

function handleDisconnect(socketId) {
  try {
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
  } catch (error) {
    console.error("Disconnect error:", error.message);
  }
}

httpServer.listen(5000, () => {
  console.log("Server running on port 5000");
});