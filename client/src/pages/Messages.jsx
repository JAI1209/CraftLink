import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import API from "../services/api";
import socket from "../socket";

/* ─── tiny helpers ───────────────────────────────────────────── */
const fmt = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const fmtDate = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  const diff = today - d;
  if (diff < 86_400_000 && d.getDate() === today.getDate()) return "Today";
  if (diff < 172_800_000) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

/* ─── Typing bubble ──────────────────────────────────────────── */
const TypingDots = () => (
  <span style={{ display: "inline-flex", gap: 4, alignItems: "center", padding: "2px 4px" }}>
    {[0, 1, 2].map((i) => (
      <span key={i} style={{
        width: 7, height: 7, borderRadius: "50%",
        background: "var(--accent-secondary)", display: "inline-block",
        animation: `typingBounce 1.2s ${i * 0.2}s ease-in-out infinite`,
      }} />
    ))}
  </span>
);

/* ─── Skeleton loader ────────────────────────────────────────── */
const ConvSkeleton = () => (
  <div style={{ padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
    <div className="skel-pulse" style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0 }} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="skel-pulse" style={{ height: 13, borderRadius: 6, width: "55%" }} />
      <div className="skel-pulse" style={{ height: 11, borderRadius: 6, width: "80%" }} />
    </div>
  </div>
);

const MsgSkeleton = ({ right }) => (
  <div style={{ display: "flex", justifyContent: right ? "flex-end" : "flex-start", padding: "4px 0" }}>
    <div className="skel-pulse" style={{ height: 38, borderRadius: 18, width: 140 + (right ? 60 : 20) }} />
  </div>
);

/* ══════════════════════════════════════════════════════════════ */
const Messages = () => {
  const [conversations,        setConversations]        = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages,             setMessages]             = useState([]);
  const [text,                 setText]                 = useState("");
  const [loading,              setLoading]              = useState(true);
  const [msgsLoading,          setMsgsLoading]          = useState(false);
  const [onlineUsers,          setOnlineUsers]          = useState([]);
  const [isTyping,             setIsTyping]             = useState(false);
  const [sending,              setSending]              = useState(false);
  const [search,               setSearch]               = useState("");
  const [mobileShowChat,       setMobileShowChat]       = useState(false);

  const navigate       = useNavigate();
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);
  const tokenRef       = useRef(localStorage.getItem("token"));
  const userRef        = useRef(JSON.parse(localStorage.getItem("user") || "null"));
  const user           = userRef.current;
  const inputRef       = useRef(null);

  const nid = useCallback((v) => {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (typeof v._id === "string") return v._id;
    return v._id?.toString?.() ?? v.toString();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user?._id) return;
    const addUser = () => socket.emit("addUser", user._id);
    if (socket.connected) addUser();
    socket.on("connect", addUser);
    socket.on("getOnlineUsers", setOnlineUsers);
    return () => {
      socket.off("connect", addUser);
      socket.off("getOnlineUsers", setOnlineUsers);
    };
  }, []); // eslint-disable-line

  const selectedConvRef = useRef(selectedConversation);
  useEffect(() => { selectedConvRef.current = selectedConversation; }, [selectedConversation]);

  useEffect(() => {
    const handleGetMessage = (data) => {
      const conv = selectedConvRef.current;
      setConversations((prev) =>
        prev.map((c) => {
          const relevant = c.members.some(
            (m) => nid(m._id || m) === data.senderId || nid(m._id || m) === data.receiverId
          );
          const isSelected = conv && nid(conv._id) === nid(c._id);
          return relevant
            ? {
                ...c,
                lastMessage: data.text,
                updatedAt: new Date().toISOString(),
                unreadForMe: isSelected ? 0 : (c.unreadForMe || 0) + 1,
              }
            : c;
        })
      );
      if (!conv) return;
      const belongsHere = conv.members.some((m) => nid(m._id || m) === data.senderId);
      if (!belongsHere) return;
      if (data.senderId === nid(user?._id)) return;
      setMessages((prev) => [
        ...prev,
        {
          _id:       data._id       ?? Date.now().toString(),
          sender:    { _id: data.senderId },
          text:      data.text,
          createdAt: data.createdAt ?? new Date().toISOString(),
        },
      ]);
    };
    const handleTypingOn  = () => setIsTyping(true);
    const handleTypingOff = () => setIsTyping(false);
    socket.on("getMessage", handleGetMessage);
    socket.on("userTyping", handleTypingOn);
    socket.on("stopTyping", handleTypingOff);
    return () => {
      socket.off("getMessage", handleGetMessage);
      socket.off("userTyping", handleTypingOn);
      socket.off("stopTyping", handleTypingOff);
    };
  }, [nid]); // eslint-disable-line

  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    setMsgsLoading(true);
    try {
      const { data } = await API.get(`/messages/conversation/${conversationId}`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      });
      setMessages(data);
    } catch (err) {
      console.error("fetchMessages error:", err.message);
    } finally {
      setMsgsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!tokenRef.current) { setLoading(false); return; }
    const fetchConversations = async () => {
      try {
        const { data } = await API.get("/messages/conversations", {
          headers: { Authorization: `Bearer ${tokenRef.current}` },
        });
        setConversations(data);
        if (data.length > 0) {
          setSelectedConversation(data[0]);
          fetchMessages(data[0]._id);
        }
      } catch (err) {
        console.error("fetchConversations error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [fetchMessages]);

  const handleSelectConversation = useCallback((conv) => {
    setSelectedConversation(conv);
    setConversations((prev) =>
      prev.map((item) => nid(item._id) === nid(conv._id) ? { ...item, unreadForMe: 0 } : item)
    );
    setMessages([]);
    setIsTyping(false);
    fetchMessages(conv._id);
    setMobileShowChat(true);
  }, [fetchMessages]);

  const handleSend = useCallback(async () => {
    if (!text.trim() || !selectedConvRef.current) return;
    setSending(true);
    const conv      = selectedConvRef.current;
    const myId      = nid(user?._id);
    const otherUser = conv.members.find((m) => nid(m._id || m) !== myId);
    if (!otherUser) { setSending(false); return; }
    const receiverId = nid(otherUser._id || otherUser);
    try {
      const { data } = await API.post(
        "/messages/send",
        { receiverId, text },
        { headers: { Authorization: `Bearer ${tokenRef.current}` } }
      );
      setMessages((prev) => [...prev, { ...data, sender: { _id: myId } }]);
      socket.emit("sendMessage", {
        senderId: myId, receiverId, text,
        conversationId: conv._id, _id: data._id, createdAt: data.createdAt,
      });
      setConversations((prev) =>
        prev.map((c) => nid(c._id) === nid(conv._id) ? { ...c, lastMessage: text } : c)
      );
      setText("");
      socket.emit("stopTyping", { conversationId: conv._id, receiverId });
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (err) {
      console.error("Send error:", err.message);
    } finally {
      setSending(false);
    }
  }, [text, nid]); // eslint-disable-line

  const handleTypingInput = useCallback((e) => {
    setText(e.target.value);
    const conv = selectedConvRef.current;
    if (!conv) return;
    const myId       = nid(user?._id);
    const otherUser  = conv.members.find((m) => nid(m._id || m) !== myId);
    const receiverId = nid(otherUser._id || otherUser);
    socket.emit("typing", { conversationId: conv._id, receiverId });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("stopTyping", { conversationId: conv._id, receiverId });
    }, 1500);
  }, [nid]); // eslint-disable-line

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const isOnline = (userId) => onlineUsers.some((u) => nid(u.userId) === nid(userId));
  const myId     = nid(user?._id);

  const filteredConversations = conversations.filter((conv) => {
    const other = conv.members.find((m) => nid(m._id || m) !== myId);
    if (!other) return false;
    return !search || (other.name || "").toLowerCase().includes(search.toLowerCase());
  });

  const selectedOther = selectedConversation
    ? selectedConversation.members.find((m) => nid(m._id || m) !== myId)
    : null;

  if (loading) {
    return (
      <>
        <style>{STYLES}</style>
        <div style={css.root}>
          <div style={css.sidebar}>
            <div style={css.sidebarHeader}>
              <div className="skel-pulse" style={{ height: 22, width: "55%", borderRadius: 8, marginBottom: 10 }} />
              <div className="skel-pulse" style={{ height: 36, borderRadius: 12 }} />
            </div>
            <div style={css.convList}>
              {[...Array(6)].map((_, i) => <ConvSkeleton key={i} />)}
            </div>
          </div>
          <div style={css.chatArea}>
            <div style={css.chatHeader}>
              <div className="skel-pulse" style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skel-pulse" style={{ height: 14, width: "30%", borderRadius: 6, marginBottom: 6 }} />
                <div className="skel-pulse" style={{ height: 11, width: "18%", borderRadius: 6 }} />
              </div>
            </div>
            <div style={{ ...css.msgsArea, gap: 14 }}>
              {[0, 1, 1, 0, 0, 1, 0].map((r, i) => <MsgSkeleton key={i} right={r} />)}
            </div>
          </div>
        </div>
      </>
    );
  }

  let lastDate = null;

  return (
    <>
      <style>{STYLES}</style>
      <div style={css.root}>
        <div
          className="msg-sidebar"
          style={css.sidebar}
          data-mobile-hidden={mobileShowChat ? "true" : "false"}
        >
          <div style={css.sidebarHeader}>
            <button
              onClick={() => navigate("/")}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "none", border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer", fontSize: "0.8rem",
                padding: "0 0 0.75rem 0",
                fontFamily: "var(--font-body)",
                transition: "var(--transition)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
            >
              ← Home
            </button>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h1 style={css.sidebarTitle}>Messages</h1>
                <p style={css.sidebarSub}>Realtime conversations</p>
              </div>
              <div style={css.onlineBadge}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block", flexShrink: 0 }} />
                {onlineUsers.length} online
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem", pointerEvents: "none", color: "var(--text-secondary)" }}>🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search conversations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={css.searchInput}
              />
            </div>
          </div>

          <div style={css.convList}>
            {filteredConversations.length === 0 ? (
              <div style={css.emptyConvWrap}>
                <div style={{ fontSize: "2.5rem" }}>💬</div>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  {search ? "No results found" : "No conversations yet"}
                </p>
                {!search && (
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", textAlign: "center" }}>
                    Message a skill seller to start chatting.
                  </p>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const other      = conv.members.find((m) => nid(m._id || m) !== myId);
                if (!other) return null;
                const isSelected = selectedConversation?._id === conv._id;
                const online     = isOnline(other._id);
                return (
                  <div
                    key={conv._id}
                    className="conv-item"
                    onClick={() => handleSelectConversation(conv)}
                    style={css.convItem(isSelected)}
                  >
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <img
                        src={other.avatar || "https://i.imgur.com/HeIi0wU.png"}
                        alt={other.name || "User"}
                        style={css.avatar}
                      />
                      <span style={online ? css.onlineDot : css.offlineDot} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={css.convName}>{other.name || "User"}</p>
                      <p style={css.convPreview}>{conv.lastMessage || "Say hello 👋"}</p>
                    </div>
                    {conv.unreadForMe > 0 && (
                      <span style={css.unreadBadge}>
                        {conv.unreadForMe > 99 ? "99+" : conv.unreadForMe}
                      </span>
                    )}
                    {conv.updatedAt && (
                      <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)", flexShrink: 0 }}>
                        {fmtDate(conv.updatedAt)}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div
          className="msg-chat"
          style={css.chatArea}
          data-mobile-hidden={!mobileShowChat && conversations.length > 0 ? "true" : "false"}
        >
          {!selectedConversation ? (
            <div style={css.emptyChat}>
              <div style={css.emptyChatIcon}>💬</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--text-primary)", margin: 0 }}>
                Select a conversation
              </h3>
              <p style={{ fontSize: "0.88rem", maxWidth: 280, textAlign: "center", lineHeight: 1.6, color: "var(--text-secondary)" }}>
                Choose a conversation from the sidebar to start messaging.
              </p>
            </div>
          ) : (
            <>
              <div style={css.chatHeader}>
                <button
                  className="mobile-back-btn"
                  onClick={() => setMobileShowChat(false)}
                  style={css.mobileBackBtn}
                >
                  ← Back
                </button>
                {selectedOther && (
                  <>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <img
                        src={selectedOther.avatar || "https://i.imgur.com/HeIi0wU.png"}
                        alt={selectedOther.name}
                        style={{ ...css.avatar, width: 42, height: 42 }}
                      />
                      <span style={isOnline(selectedOther._id) ? css.onlineDot : css.offlineDot} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={css.chatHeaderName}>{selectedOther.name || "User"}</p>
                      <p style={{
                        fontSize: "0.75rem",
                        color: isTyping
                          ? "var(--accent-secondary)"
                          : isOnline(selectedOther._id) ? "#4ade80" : "var(--text-secondary)",
                        fontStyle: isTyping ? "italic" : "normal",
                      }}>
                        {isTyping ? "typing…" : isOnline(selectedOther._id) ? "● Online" : "○ Offline"}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div style={css.msgsArea}>
                {msgsLoading ? (
                  [...Array(6)].map((_, i) => <MsgSkeleton key={i} right={i % 3 === 0} />)
                ) : messages.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 12, color: "var(--text-secondary)" }}>
                    <div style={{ fontSize: "2rem" }}>👋</div>
                    <p style={{ fontSize: "0.9rem" }}>No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe    = nid(msg.sender?._id) === myId || nid(msg.sender) === myId;
                    const msgDate = fmtDate(msg.createdAt);
                    const showDivider = msgDate !== lastDate;
                    if (showDivider) lastDate = msgDate;
                    return (
                      <div key={msg._id}>
                        {showDivider && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1rem 0 0.5rem" }}>
                            <div style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
                            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", padding: "0.22rem 0.75rem", background: "rgba(255,245,230,0.04)", borderRadius: 999, border: "1px solid var(--border-color)", whiteSpace: "nowrap" }}>
                              {msgDate}
                            </span>
                            <div style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
                          </div>
                        )}
                        <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8, marginBottom: 2 }}>
                          {!isMe && selectedOther && (
                            <img
                              src={selectedOther.avatar || "https://i.imgur.com/HeIi0wU.png"}
                              alt=""
                              style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border-color)", display: "block" }}
                            />
                          )}
                          <div style={{ maxWidth: "62%" }}>
                            <div
                              className={isMe ? "bubble-me" : "bubble-them"}
                              style={{
                                padding: "0.6rem 1rem",
                                fontSize: "0.88rem",
                                lineHeight: 1.6,
                                wordBreak: "break-word",
                                borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                background: isMe
                                  ? "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))"
                                  : "rgba(255,245,230,0.06)",
                                color: isMe ? "#131111" : "var(--text-primary)",
                                border: isMe ? "none" : "1px solid var(--border-color)",
                                boxShadow: isMe ? "0 4px 16px rgba(200,116,42,0.28)" : "none",
                              }}
                            >
                              {msg.text}
                            </div>
                            <p style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginTop: 3, textAlign: isMe ? "right" : "left" }}>
                              {msg.createdAt ? fmt(msg.createdAt) : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {isTyping && selectedOther && (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginTop: 4 }}>
                    <img
                      src={selectedOther.avatar || "https://i.imgur.com/HeIi0wU.png"}
                      alt=""
                      style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border-color)", display: "block" }}
                    />
                    <div style={{ background: "rgba(255,245,230,0.06)", border: "1px solid var(--border-color)", borderRadius: "18px 18px 18px 4px", padding: "0.55rem 1rem", display: "inline-flex", alignItems: "center" }}>
                      <TypingDots />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={css.inputArea}>
                <input
                  ref={inputRef}
                  type="text"
                  className="msg-input"
                  value={text}
                  onChange={handleTypingInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send)"
                  disabled={sending}
                  style={css.inputField}
                />
                <button
                  className="send-btn"
                  onClick={handleSend}
                  disabled={!text.trim() || sending}
                  style={{
                    flexShrink: 0, width: 46, height: 46, borderRadius: "50%",
                    background: !text.trim() || sending ? "rgba(255,245,230,0.06)" : "var(--gradient-primary)",
                    border: "none",
                    cursor: !text.trim() || sending ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "var(--transition)",
                    opacity: !text.trim() || sending ? 0.45 : 1,
                    boxShadow: !text.trim() || sending ? "none" : "0 4px 16px rgba(200,116,42,0.3)",
                  }}
                >
                  <Send size={18} strokeWidth={2.2} style={{ color: "#fff" }} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

/* ── styles ───────────────────────────────────────────────────── */
const css = {
  root: {
    display: "flex",
    height: "calc(100vh - 70px)",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    overflow: "hidden",
    fontFamily: "var(--font-body)",
    position: "relative",
  },
  sidebar: {
    width: 310, flexShrink: 0,
    display: "flex", flexDirection: "column",
    borderRight: "1px solid var(--border-color)",
    background: "var(--bg-secondary)",
    zIndex: 10, transition: "transform 0.3s ease",
  },
  sidebarHeader: { padding: "1.35rem 1.25rem 1.1rem", borderBottom: "1px solid var(--border-color)" },
  sidebarTitle: {
    fontSize: "1.4rem", fontWeight: 700,
    fontFamily: "var(--font-display)", marginBottom: "0.15rem",
    color: "var(--text-primary)", lineHeight: 1.2,
  },
  sidebarSub: { fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 0 },
  searchInput: {
    width: "100%", background: "rgba(255,245,230,0.04)",
    border: "1px solid var(--border-color)", color: "var(--text-primary)",
    borderRadius: 12, padding: "0.6rem 1rem 0.6rem 2.2rem",
    fontSize: "0.83rem", outline: "none",
    transition: "var(--transition)", fontFamily: "var(--font-body)",
  },
  convList: { flex: 1, overflowY: "auto", paddingBottom: "0.5rem" },
  convItem: (selected) => ({
    display: "flex", alignItems: "center", gap: "0.75rem",
    padding: "0.85rem 1.25rem", cursor: "pointer",
    transition: "var(--transition)",
    borderBottom: "1px solid rgba(200,116,42,0.05)",
    background: selected
      ? "linear-gradient(90deg, rgba(200,116,42,0.11), rgba(200,116,42,0.03))"
      : "transparent",
    borderLeft: selected ? "3px solid var(--accent-primary)" : "3px solid transparent",
  }),
  avatar: {
    width: 46, height: 46, borderRadius: "50%",
    objectFit: "cover", border: "1.5px solid var(--border-color)", display: "block",
  },
  onlineDot: {
    position: "absolute", bottom: 1, right: 1,
    width: 11, height: 11, background: "#22c55e",
    border: "2px solid var(--bg-secondary)", borderRadius: "50%",
  },
  offlineDot: {
    position: "absolute", bottom: 1, right: 1,
    width: 11, height: 11, background: "rgba(255,255,255,0.15)",
    border: "2px solid var(--bg-secondary)", borderRadius: "50%",
  },
  convName: {
    fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)",
    marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  convPreview: {
    fontSize: "0.77rem", color: "var(--text-secondary)",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  onlineBadge: {
    display: "flex", alignItems: "center", gap: 5,
    fontSize: "0.72rem", fontWeight: 500,
    background: "rgba(34,197,94,0.1)", color: "#4ade80",
    border: "1px solid rgba(34,197,94,0.18)",
    borderRadius: 999, padding: "0.28rem 0.65rem", flexShrink: 0,
  },
  unreadBadge: {
    minWidth: 20, height: 20, padding: "0 0.4rem",
    borderRadius: 999, background: "var(--lime)", color: "var(--ink)",
    fontSize: "0.7rem", fontWeight: 900,
    display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  chatArea: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "var(--bg-primary)" },
  chatHeader: {
    display: "flex", alignItems: "center", gap: "0.85rem",
    padding: "1rem 1.4rem", borderBottom: "1px solid var(--border-color)",
    background: "var(--bg-secondary)", flexShrink: 0,
  },
  chatHeaderName: {
    fontSize: "1rem", fontWeight: 700,
    color: "var(--text-primary)", marginBottom: 1,
    fontFamily: "var(--font-display)",
  },
  msgsArea: {
    flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem",
    display: "flex", flexDirection: "column", gap: "0.2rem",
  },
  inputArea: {
    flexShrink: 0, padding: "0.9rem 1.25rem",
    borderTop: "1px solid var(--border-color)",
    background: "var(--bg-secondary)",
    display: "flex", gap: "0.7rem", alignItems: "center",
  },
  inputField: {
    flex: 1, background: "rgba(255,245,230,0.04)",
    border: "1px solid var(--border-color)", borderRadius: 14,
    padding: "0.7rem 1.1rem", color: "var(--text-primary)",
    fontSize: "0.87rem", outline: "none",
    fontFamily: "var(--font-body)", lineHeight: 1.5, transition: "var(--transition)",
  },
  emptyChat: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: "0.85rem",
  },
  emptyChatIcon: {
    width: 80, height: 80, borderRadius: "50%",
    background: "rgba(200,116,42,0.08)", border: "1px solid var(--border-color)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "2rem", marginBottom: "0.4rem",
  },
  emptyConvWrap: {
    padding: "3rem 1.5rem", textAlign: "center",
    display: "flex", flexDirection: "column", alignItems: "center", gap: "0.7rem",
  },
  mobileBackBtn: {
    display: "none", background: "rgba(255,245,230,0.06)",
    border: "1px solid var(--border-color)", borderRadius: 10,
    color: "var(--text-primary)", padding: "0.38rem 0.8rem",
    cursor: "pointer", fontSize: "0.82rem",
    alignItems: "center", gap: 5,
    fontFamily: "var(--font-body)", flexShrink: 0,
  },
};

const STYLES = `
  @keyframes typingBounce {
    0%,60%,100% { transform:translateY(0); opacity:.4 }
    30%          { transform:translateY(-6px); opacity:1 }
  }
  .skel-pulse {
    background: linear-gradient(90deg,
      rgba(200,116,42,0.07) 25%,
      rgba(200,116,42,0.14) 50%,
      rgba(200,116,42,0.07) 75%);
    background-size: 200% 100%;
    animation: skelShimmer 1.6s ease infinite;
  }
  @keyframes skelShimmer {
    0%   { background-position:200% 0 }
    100% { background-position:-200% 0 }
  }
  .conv-item:hover { background: rgba(200,116,42,0.07) !important; }
  .msg-input:focus {
    border-color: rgba(200,116,42,0.45) !important;
    background: rgba(200,116,42,0.04) !important;
    box-shadow: 0 0 0 3px rgba(200,116,42,0.1) !important;
  }
  .search-input:focus {
    border-color: rgba(200,116,42,0.45) !important;
    background: rgba(200,116,42,0.04) !important;
  }
  .send-btn:hover:not(:disabled) {
    transform: scale(1.08) !important;
    box-shadow: 0 6px 22px rgba(200,116,42,0.45) !important;
  }
  .bubble-me  { transition: transform 0.15s ease; }
  .bubble-me:hover { transform: scale(1.015); }
  .bubble-them { transition: transform 0.15s ease; }

  @media (min-width: 769px) {
    .msg-sidebar {
      transform: translateX(0) !important;
      position: relative !important;
      width: 310px !important;
    }
    .msg-chat { display: flex !important; }
    .mobile-back-btn { display: none !important; }
  }

  @media (max-width: 768px) {
    .msg-sidebar {
      position: absolute !important;
      left: 0; top: 0; bottom: 0;
      width: 100% !important;
      z-index: 50;
    }
    .msg-sidebar[data-mobile-hidden="true"] { transform: translateX(-100%) !important; }
    .msg-sidebar[data-mobile-hidden="false"] { transform: translateX(0) !important; }
    .msg-chat[data-mobile-hidden="true"] { display: none !important; }
    .mobile-back-btn { display: flex !important; }
  }
`;

export default Messages;