import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../services/api";

const SkillCard = ({ _id, title, category, description, price, rating, username, userId, avatar }) => {
  const navigate = useNavigate();
  const [saved, setSaved]     = useState(false);
  const [msgLoading, setMsg]  = useState(false);

  const token = localStorage.getItem("token");
  const me    = JSON.parse(localStorage.getItem("user") || "null");
  const nid   = (v) => v?._id?.toString() || v?.toString() || "";
  const isMe  = me && nid(userId) === nid(me._id);

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!token) return toast.error("Please login first");
    try {
      const { data } = await API.post(`/skills/save/${_id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSaved(!saved);
      toast.success(data.message);
    } catch { toast.error("Could not save"); }
  };

  const handleMsg = async (e) => {
    e.stopPropagation();
    if (!token) return toast.error("Please login first");
    if (isMe) return toast.error("That's your own skill");
    setMsg(true);
    try {
      await API.post("/messages/send", { receiverId: nid(userId), text: `Hi! I'm interested in your "${title}" service.` }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Chat started!");
      navigate("/messages");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setMsg(false); }
  };

  return (
    <motion.article
      onClick={() => navigate(`/skills/${_id}`)}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: [0.16,1,0.3,1] }}
      style={{
        background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)",
        overflow: "hidden", cursor: "pointer", position: "relative", display: "flex", flexDirection: "column",
        transition: "border-color 0.25s, box-shadow 0.25s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-hi)"; e.currentTarget.style.boxShadow = "var(--shadow-lime)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* TOP STRIP */}
      <div style={{ height: 4, background: "var(--grad-brand)", opacity: 0.7 }} />

      <div style={{ padding: "1.4rem", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* ROW 1: CATEGORY + SAVE */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <span className="badge badge-lime">{category}</span>
          <button onClick={handleSave} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: saved ? "var(--lime)" : "var(--muted)", transition: "color 0.15s" }}>
            {saved ? "♥" : "♡"}
          </button>
        </div>

        {/* TITLE */}
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, color: "var(--white)", marginBottom: "0.6rem", lineHeight: 1.3, letterSpacing: "-0.02em" }}>
          {title}
        </h3>

        {/* DESC */}
        <p style={{ fontSize: "0.84rem", color: "var(--muted)", lineHeight: 1.65, flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "1.2rem" }}>
          {description}
        </p>

        {/* USER */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.2rem", padding: "0.7rem", background: "var(--surface-2)", borderRadius: "var(--r-md)" }}>
          <img src={avatar || "https://i.imgur.com/HeIi0wU.png"} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: "1.5px solid var(--border)" }} />
          <span style={{ fontSize: "0.8rem", color: "var(--off-white)", fontWeight: 500 }}>{username}</span>
          {rating > 0 && <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--lime)", fontFamily: "var(--font-mono)" }}>★ {rating}</span>}
        </div>

        {/* FOOTER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", color: "var(--white)", letterSpacing: "-0.03em" }}>₹{price}</span>
          <button
            onClick={handleMsg}
            disabled={msgLoading}
            style={{
              padding: "0.55rem 1.1rem", borderRadius: "var(--r-md)",
              background: "var(--lime)", color: "#080808",
              fontWeight: 700, fontSize: "0.78rem",
              fontFamily: "var(--font-display)",
              border: "none", cursor: msgLoading ? "wait" : "pointer",
              opacity: msgLoading ? 0.6 : 1, transition: "opacity 0.15s",
            }}
          >
            {msgLoading ? "..." : "Message"}
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default SkillCard;
