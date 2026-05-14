const Notification = require("../models/Notification");
const { emitNotificationCount, getUnreadCount } = require("../services/notificationService");

const getNotifications = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const notificationQuery = { recipient: req.user._id, type: { $ne: "message" } };

    const notifications = await Notification.find(notificationQuery)
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      ...notificationQuery,
      read: false,
    });

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true, readAt: new Date() },
      { new: true }
    ).populate("sender", "name avatar");

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const unreadCount = await emitNotificationCount(req.user._id);

    res.status(200).json({ notification, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    await emitNotificationCount(req.user._id);

    res.status(200).json({ unreadCount: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
