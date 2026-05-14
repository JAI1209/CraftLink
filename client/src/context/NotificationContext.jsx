/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import API from "../services/api";
import socket from "../socket";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

const normalizeId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id?.toString?.() || value.toString?.() || "";
};

export const NotificationProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.get("/notifications", {
        headers: authHeaders,
      });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Fetch notifications failed:", error.message);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, token]);

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!token || !notificationId) return;

      setNotifications((prev) =>
        prev.map((notification) =>
          normalizeId(notification) === notificationId
            ? { ...notification, read: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));

      try {
        const { data } = await API.patch(
          `/notifications/${notificationId}/read`,
          {},
          { headers: authHeaders }
        );
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error("Mark notification read failed:", error.message);
        fetchNotifications();
      }
    },
    [authHeaders, fetchNotifications, token]
  );

  const markAllAsRead = useCallback(async () => {
    if (!token || unreadCount === 0) return;

    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
        readAt: notification.readAt || new Date().toISOString(),
      }))
    );
    setUnreadCount(0);

    try {
      await API.patch("/notifications/read-all", {}, { headers: authHeaders });
    } catch (error) {
      console.error("Mark all notifications read failed:", error.message);
      fetchNotifications();
    }
  }, [authHeaders, fetchNotifications, token, unreadCount]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!token || !user?._id) return;

    const registerUser = () => socket.emit("addUser", user._id);
    const handleNewNotification = ({ notification, unreadCount: nextUnread }) => {
      if (!notification) return;

      setNotifications((prev) => {
        const exists = prev.some((item) => normalizeId(item) === normalizeId(notification));
        if (exists) return prev;
        return [notification, ...prev].slice(0, 20);
      });
      setUnreadCount((prev) =>
        typeof nextUnread === "number" ? nextUnread : prev + 1
      );
    };
    const handleNotificationCount = ({ unreadCount: nextUnread }) => {
      if (typeof nextUnread === "number") setUnreadCount(nextUnread);
    };

    if (socket.connected) registerUser();
    socket.on("connect", registerUser);
    socket.on("notification:new", handleNewNotification);
    socket.on("notification:count", handleNotificationCount);

    return () => {
      socket.off("connect", registerUser);
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:count", handleNotificationCount);
    };
  }, [token, user?._id]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
    }),
    [
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }
  return context;
};
