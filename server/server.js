const express = require("express");
const cors    = require("cors");
const http    = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");

const app        = express();
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

connectDB();

app.use(cors({
  origin: [
    CLIENT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://craft-link-olive.vercel.app",
    /\.vercel\.app$/
  ],
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use("/api/auth",          require("./routes/authRoutes"));
app.use("/api/skills",        require("./routes/skillRoutes"));
app.use("/api/messages",      require("./routes/messageRoutes"));
app.use("/api/users",         require("./routes/userRoutes"));
app.use("/api/requests",      require("./routes/requestRoutes"));
app.use("/api/reviews",       require("./routes/reviewRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/notes",         require("./routes/collabNoteRoutes"));
app.use("/api/dashboard",     require("./routes/dashboardRoutes"));
app.use("/api/crowdfunding",  require("./routes/crowdfundingRoutes"));
app.use("/api/challenges",    require("./routes/challengeRoutes"));

app.get("/", (req, res) => res.send("CraftLink API Running 🚀"));

// ── SOCKET.IO ─────────────────────────────────────────────────────────────────
const server = http.createServer(app);
const io     = new Server(server, {
  cors: {
    origin: [
      CLIENT_URL,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://craft-link-olive.vercel.app",
      /\.vercel\.app$/
    ],
    methods:     ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

let onlineUsers      = [];
global.onlineUsers   = onlineUsers;
global.io            = io;

io.on("connection", (socket) => {
  // ── ADD USER ──────────────────────────────────────────────────────────────
  socket.on("addUser", (userId) => {
    const existing = onlineUsers.find(u => u.userId === userId);
    if (existing) existing.socketId = socket.id;
    else          onlineUsers.push({ userId, socketId: socket.id });

    global.onlineUsers = onlineUsers;
    io.emit("getOnlineUsers", onlineUsers);

    const { emitNotificationCount } = require("./services/notificationService");
    emitNotificationCount(userId).catch(() => {});
  });

  // ── SEND MESSAGE (real-time relay) ────────────────────────────────────────
  socket.on("sendMessage", (data) => {
    const user = onlineUsers.find(u => u.userId === data.receiverId);
    if (user) io.to(user.socketId).emit("getMessage", data);
  });

  // ── TYPING INDICATORS ─────────────────────────────────────────────────────
  socket.on("typing", (data) => {
    const user = onlineUsers.find(u => u.userId === data.receiverId);
    if (user) io.to(user.socketId).emit("userTyping", data);
  });

  socket.on("stopTyping", (data) => {
    const user = onlineUsers.find(u => u.userId === data.receiverId);
    if (user) io.to(user.socketId).emit("stopTyping", data);
  });

  socket.on("note:join", ({ noteId, user }) => {
    if (!noteId) return;
    socket.join(`note:${noteId}`);
    socket.to(`note:${noteId}`).emit("note:presence", {
      noteId, user, status: "joined",
    });
  });

  socket.on("note:leave", ({ noteId, user }) => {
    if (!noteId) return;
    socket.leave(`note:${noteId}`);
    socket.to(`note:${noteId}`).emit("note:presence", {
      noteId, user, status: "left",
    });
  });

  socket.on("note:editing", ({ noteId, user, cursor }) => {
    if (!noteId) return;
    socket.to(`note:${noteId}`).emit("note:editing", { noteId, user, cursor });
  });

  socket.on("note:draft", ({ noteId, user, content, title }) => {
    if (!noteId) return;
    socket.to(`note:${noteId}`).emit("note:draft", {
      noteId, user, content, title,
      updatedAt: new Date().toISOString(),
    });
  });

  socket.on("challenge:join", ({ challengeId }) => {
    if (challengeId) socket.join(`challenge:${challengeId}`);
  });

  socket.on("challenge:leave", ({ challengeId }) => {
    if (challengeId) socket.leave(`challenge:${challengeId}`);
  });

  // ── DISCONNECT ────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    onlineUsers        = onlineUsers.filter(u => u.socketId !== socket.id);
    global.onlineUsers = onlineUsers;
    io.emit("getOnlineUsers", onlineUsers);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));