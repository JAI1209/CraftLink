import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import API from "../services/api";
import socket from "../socket";

const ChatBox = ({ conversation, currentUser }) => {
  const [messages,  setMessages]  = useState([]);
  const [text,      setText]      = useState("");
  const [loading,   setLoading]   = useState(true);
  const [isTyping,  setIsTyping]  = useState(false);
  const [sending,   setSending]   = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);
  const tokenRef       = useRef(localStorage.getItem("token"));

  const conversationId      = conversation?._id      ?? null;
  const conversationMembers = conversation?.members  ?? [];
  const currentUserId       = currentUser?._id       ?? null;

  // ── NORMALIZE ID ────────────────────────────────────────────────────────────
  const nid = useCallback((v) => {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (typeof v._id === "string") return v._id;
    return v._id?.toString?.() ?? v.toString();
  }, []);

  // ── DERIVED ─────────────────────────────────────────────────────────────────
  const myId = useMemo(() => nid(currentUserId), [nid, currentUserId]);

  const otherUser = useMemo(
    () => conversationMembers.find((m) => nid(m) !== myId && nid(m._id) !== myId) ?? null,
    [conversationMembers, nid, myId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const otherUserId = useMemo(
    () => nid(otherUser?._id) || nid(otherUser),
    [nid, otherUser]
  );

  // ── SCROLL ──────────────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // ── FETCH MESSAGES ───────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/messages/conversation/${conversationId}`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      });
      setMessages(data);
    } catch (err) {
      console.error("fetchMessages error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // ── SOCKET: RECEIVE ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handleGetMessage = (data) => {
      if (!conversationId) return;
      if (data.conversationId && data.conversationId !== conversationId) return;
      if (!data.conversationId && data.senderId !== otherUserId) return;
      if (data.senderId === myId) return;

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

    const onTyping = () => setIsTyping(true);
    const onStop   = () => setIsTyping(false);

    socket.on("getMessage", handleGetMessage);
    socket.on("userTyping", onTyping);
    socket.on("stopTyping", onStop);

    return () => {
      socket.off("getMessage", handleGetMessage);
      socket.off("userTyping", onTyping);
      socket.off("stopTyping", onStop);
    };
  }, [conversationId, myId, otherUserId]);

  // ── TYPING ───────────────────────────────────────────────────────────────────
  const handleTyping = useCallback((e) => {
    setText(e.target.value);
    socket.emit("typing",     { conversationId, receiverId: otherUserId });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("stopTyping", { conversationId, receiverId: otherUserId });
    }, 1500);
  }, [conversationId, otherUserId]);

  // ── SEND ─────────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!text.trim() || !conversationId) return;
    setSending(true);
    try {
      const { data } = await API.post(
        "/messages/send",
        { receiverId: otherUserId, text },
        { headers: { Authorization: `Bearer ${tokenRef.current}` } }
      );

      setMessages((prev) => [...prev, { ...data, sender: { _id: myId } }]);

      socket.emit("sendMessage", {
        senderId:       myId,
        receiverId:     otherUserId,
        text,
        conversationId,
        _id:            data._id,
        createdAt:      data.createdAt,
      });

      setText("");
      socket.emit("stopTyping", { conversationId, receiverId: otherUserId });
    } catch (err) {
      console.error("Send error:", err.message);
    } finally {
      setSending(false);
    }
  }, [text, conversationId, otherUserId, myId]);

  // ── ENTER KEY ────────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  // ── FORMAT TIME ──────────────────────────────────────────────────────────────
  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ── NO CONVERSATION ──────────────────────────────────────────────────────────
  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
        <p className="text-5xl mb-3">💬</p>
        <p className="text-lg font-semibold text-zinc-300">Select a conversation</p>
        <p className="text-sm mt-1">Choose a chat from the sidebar to start messaging.</p>
      </div>
    );
  }

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">

      {/* HEADER */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800 bg-zinc-900 shrink-0">
        <img
          src={otherUser?.avatar || "https://i.imgur.com/HeIi0wU.png"}
          alt={otherUser?.name || "User"}
          className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500 shrink-0"
        />
        <div>
          <p className="font-semibold text-white">{otherUser?.name || "User"}</p>
          {isTyping && (
            <p className="text-xs text-emerald-400">typing…</p>
          )}
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-zinc-950">
        {loading ? (
          <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
            Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
            No messages yet. Say hello! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = nid(msg.sender?._id) === myId || nid(msg.sender) === myId;
            return (
              <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                {!isMe && (
                  <img
                    src={otherUser?.avatar || "https://i.imgur.com/HeIi0wU.png"}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover mr-2 self-end shrink-0"
                  />
                )}
                <div className="max-w-[65%]">
                  <div className={`px-4 py-2.5 text-sm leading-relaxed break-words ${
                    isMe
                      ? "bg-cyan-500 text-black rounded-[18px_18px_4px_18px]"
                      : "bg-zinc-800 text-white border border-zinc-700 rounded-[18px_18px_18px_4px]"
                  }`}>
                    {msg.text}
                  </div>
                  <p className={`text-[11px] text-zinc-500 mt-1 ${isMe ? "text-right" : "text-left"}`}>
                    {msg.createdAt ? formatTime(msg.createdAt) : ""}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Typing bubble */}
        {isTyping && (
          <div className="flex items-end gap-2">
            <img
              src={otherUser?.avatar || "https://i.imgur.com/HeIi0wU.png"}
              alt=""
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
            <div className="bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-[18px_18px_18px_4px] text-zinc-400 text-sm">
              <span style={{ letterSpacing: "3px" }}>•••</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="flex gap-3 px-5 py-4 border-t border-zinc-800 bg-zinc-950 shrink-0">
        <input
          type="text"
          value={text}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          disabled={sending}
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-6 rounded-2xl font-semibold text-black text-sm shrink-0"
        >
          {sending ? "…" : "Send"}
        </button>
      </div>

    </div>
  );
};

export default ChatBox;