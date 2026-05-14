const Notification = require("../models/Notification");

const findUserSocket = (userId) => {
  const onlineUsers = global.onlineUsers || [];
  return onlineUsers.find((user) => user.userId?.toString() === userId?.toString());
};

const emitToUser = (userId, eventName, payload) => {
  const receiverSocket = findUserSocket(userId);
  if (!receiverSocket || !global.io) return;
  global.io.to(receiverSocket.socketId).emit(eventName, payload);
};

const getUnreadCount = (recipient) => {
  return Notification.countDocuments({ recipient, read: false, type: { $ne: "message" } });
};

const createNotification = async ({
  recipient,
  sender = null,
  type = "system",
  title,
  message,
  link = "",
  entityType = "",
  entityId = null,
}) => {
  if (!recipient || !title || !message) return null;
  if (sender && sender.toString() === recipient.toString()) return null;

  const notification = await Notification.create({
    recipient,
    sender,
    type,
    title,
    message,
    link,
    entityType,
    entityId,
  });

  const populated = await Notification.findById(notification._id)
    .populate("sender", "name avatar")
    .lean();

  const unreadCount = await getUnreadCount(recipient);

  emitToUser(recipient, "notification:new", {
    notification: populated,
    unreadCount,
  });

  return populated;
};

const emitNotificationCount = async (recipient) => {
  const unreadCount = await getUnreadCount(recipient);
  emitToUser(recipient, "notification:count", { unreadCount });
  return unreadCount;
};

module.exports = {
  createNotification,
  emitNotificationCount,
  getUnreadCount,
};
