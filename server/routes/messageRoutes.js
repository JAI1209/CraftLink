const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const authMiddleware = require("../middleware/authMiddleware");

const getUnreadTotal = async (userId) => {
  const conversations = await Conversation.find({ members: userId }).select("unreadBy unreadCount lastMessageSender");
  return conversations.reduce((total, conversation) => {
    const directCount = conversation.unreadBy?.get?.(userId.toString()) || 0;
    if (directCount > 0) return total + directCount;
    if (conversation.lastMessageSender?.toString() !== userId.toString()) {
      return total + (conversation.unreadCount || 0);
    }
    return total;
  }, 0);
};

const emitMessageUnreadTotal = async (userId) => {
  if (!global.io) return;
  const onlineUsers = global.onlineUsers || [];
  const userSocket = onlineUsers.find((user) => user.userId === userId.toString());
  if (!userSocket) return;
  const unreadCount = await getUnreadTotal(userId);
  global.io.to(userSocket.socketId).emit("message:unread", { unreadCount });
};

// ── SEND MESSAGE ──────────────────────────────────────────────────────────────
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    if (!text)       return res.status(400).json({ message: "Message text is required" });
    if (!receiverId) return res.status(400).json({ message: "Receiver ID is required" });
    if (!mongoose.Types.ObjectId.isValid(receiverId))
                     return res.status(400).json({ message: "Invalid receiver ID" });
    if (receiverId === req.user._id.toString())
                     return res.status(400).json({ message: "Cannot send a message to yourself" });

    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    // FIX: findOneAndUpdate with $size + $setOnInsert on 'members' causes
    // "matched twice" error in MongoDB. Safe pattern: find first, create if missing.
    let conversation = await Conversation.findOne({
      members: { $all: [req.user._id, receiverObjectId] },
      $expr: { $eq: [{ $size: "$members" }, 2] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        members: [req.user._id, receiverObjectId],
      });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      sender:         req.user._id,
      receiver:       receiverObjectId,
      text,
    });

    conversation.lastMessage       = text;
    conversation.lastMessageSender = req.user._id;
    conversation.unreadBy.set(receiverId, (conversation.unreadBy.get(receiverId) || 0) + 1);
    conversation.unreadCount       = conversation.unreadBy.get(receiverId) || 0;
    await conversation.save();

    // Emit via socket if receiver is online
    const onlineUsers    = global.onlineUsers || [];
    const receiverSocket = onlineUsers.find(u => u.userId === receiverId);
    if (receiverSocket && global.io) {
      global.io.to(receiverSocket.socketId).emit("getMessage", {
        senderId:       req.user._id.toString(),
        receiverId,
        text,
        conversationId: conversation._id.toString(),
        _id:            message._id.toString(),
        createdAt:      message.createdAt,
      });
    }
    await emitMessageUnreadTotal(receiverObjectId);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const unreadCount = await getUnreadTotal(req.user._id);
    res.status(200).json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET CONVERSATIONS ─────────────────────────────────────────────────────────
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.find({ members: req.user._id })
      .populate("members",           "name avatar")
      .populate("lastMessageSender", "name avatar")
      .sort({ updatedAt: -1 });

    // Deduplicate (safety net)
    const seen   = new Set();
    const unique = conversations.filter(c => {
      const key = c.members.map(m => m._id.toString()).sort().join("_");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    res.status(200).json(unique.map((conversation) => {
      const item = conversation.toObject();
      item.unreadForMe = conversation.unreadBy?.get?.(req.user._id.toString()) || 0;
      return item;
    }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET MESSAGES IN CONVERSATION ──────────────────────────────────────────────
router.get("/conversation/:id", authMiddleware, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    if (!conversation.members.some(m => m.toString() === req.user._id.toString()))
      return res.status(403).json({ message: "Access denied" });

    const myUnread = conversation.unreadBy?.get?.(req.user._id.toString()) || 0;
    if (myUnread > 0 || conversation.unreadCount > 0) {
      conversation.unreadBy.set(req.user._id.toString(), 0);
      conversation.unreadCount = 0;
      await conversation.save();
      await emitMessageUnreadTotal(req.user._id);
    }

    const messages = await Message.find({ conversationId: req.params.id })
      .populate("sender",   "name avatar")
      .populate("receiver", "name avatar")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
