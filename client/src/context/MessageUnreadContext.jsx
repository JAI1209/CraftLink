/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import API from "../services/api";
import socket from "../socket";
import { useAuth } from "./AuthContext";

const MessageUnreadContext = createContext(null);

export const MessageUnreadProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      const { data } = await API.get("/messages/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Fetch unread messages failed:", error.message);
    }
  }, [token]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!token || !user?._id) return;

    const registerUser = () => socket.emit("addUser", user._id);
    const handleUnread = ({ unreadCount: nextUnread }) => {
      if (typeof nextUnread === "number") setUnreadCount(nextUnread);
    };

    if (socket.connected) registerUser();
    socket.on("connect", registerUser);
    socket.on("message:unread", handleUnread);

    return () => {
      socket.off("connect", registerUser);
      socket.off("message:unread", handleUnread);
    };
  }, [token, user?._id]);

  const value = useMemo(
    () => ({ unreadCount, fetchUnreadCount, setUnreadCount }),
    [fetchUnreadCount, unreadCount]
  );

  return (
    <MessageUnreadContext.Provider value={value}>
      {children}
    </MessageUnreadContext.Provider>
  );
};

export const useMessageUnread = () => {
  const context = useContext(MessageUnreadContext);
  if (!context) {
    throw new Error("useMessageUnread must be used inside MessageUnreadProvider");
  }
  return context;
};
