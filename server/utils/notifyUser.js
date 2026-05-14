const Notification = require('../models/Notification');

const notifyUser = async ({ recipientId, senderId = null, type, message, link = null }) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      link,
    });

    const populated = await notification.populate('sender', 'name avatar');

    const recipientSocketId = global.onlineUsers?.get(String(recipientId));
    if (global.io && recipientSocketId) {
      global.io.to(recipientSocketId).emit('new-notification', populated);
    }

    return populated;
  } catch (err) {
    console.error('notifyUser error:', err);
  }
};

module.exports = notifyUser;