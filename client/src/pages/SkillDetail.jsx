import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import API from "../services/api";
import StarRating from "../components/StarRating";

const SkillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill]     = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setModal] = useState(false);
  const [reqMsg, setReqMsg]   = useState("");
  const [sending, setSend]    = useState(false);

  const token = localStorage.getItem("token");
  const me    = JSON.parse(localStorage.getItem("user") || "null");
  const h     = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    Promise.all([
      API.get(`/skills/${id}`),
      API.get(`/reviews/user/${id}`).catch(() => ({ data:[] })),
    ]).then(([s, r]) => { setSkill(s.data); setReviews(r.data); })
      .catch(() => { toast.error("Not found"); navigate("/skills"); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const sendReq = async () => {
    if (!token) return toast.error("Login first");
    setSend(true);
    try {
      await API.post("/requests", { skillId:skill._id, message:reqMsg }, h);
      toast.success("Request sent!");
      setModal(false);
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setSend(false); }
  };

  const startChat = async () => {
    if (!token) return toast.error("Login first");
    try {
      await API.post("/messages/send", { receiverId:skill.user._id, text:`Hi! I'm interested in "${skill.title}"` }, h);
      toast.success("Chat started");
      navigate("/messages");
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
  };

  if (loading) return (
    <section className="section"><div className="container">
      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:"2rem" }}>
        <div className="skeleton" style={{ height:400, borderRadius:"var(--r-lg)" }} />
        <div className="skeleton" style={{ height:400, borderRadius:"var(--r-lg)" }} />
      </div>
    </div></section>
  );
  if (!skill) return null;

  const isOwner = me?._id === skill.user?._id;

  return (
    <section className="section">
      <div className="container">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:"2rem", alignItems:"start" }}>
          {/* LEFT */}
          <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
            <motion.div className="glass" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ padding:"2.5rem" }}>
              <div style={{ display:"flex", gap:"0.6rem", flexWrap:"wrap", marginBottom:"1.5rem" }}>
                <span className="badge badge-lime">{skill.category}</span>
                <span className="badge badge-muted">{skill.type}</span>
                <span className="badge badge-muted">{skill.mode}</span>
              </div>
              <h1 style={{ marginBottom:"1.2rem" }}>{skill.title}</h1>
              <p style={{ fontSize:"1rem", lineHeight:1.9, color:"var(--off-white)" }}>{skill.description}</p>
              {skill.tags?.length > 0 && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem", marginTop:"1.5rem" }}>
                  {skill.tags.map(t => (
                    <span key={t} style={{ padding:"0.25rem 0.7rem", borderRadius:"var(--r-full)", border:"1px solid var(--border)", fontSize:"0.75rem", color:"var(--muted)", fontFamily:"var(--font-mono)" }}>#{t}</span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* REVIEWS */}
            <div className="glass" style={{ padding:"2rem" }}>
              <h2 style={{ fontSize:"1.3rem", marginBottom:"1.5rem" }}>Reviews <span style={{ color:"var(--muted)", fontSize:"1rem", fontFamily:"var(--font-mono)" }}>({reviews.length})</span></h2>
              {reviews.length===0
                ? <p style={{ color:"var(--muted)", textAlign:"center", padding:"2rem 0" }}>No reviews yet.</p>
                : reviews.map(r => (
                  <div key={r._id} style={{ paddingBlock:"1.2rem", borderBottom:"1px solid var(--border)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.8rem", marginBottom:"0.6rem" }}>
                      <img src={r.reviewer?.avatar||"https://i.imgur.com/HeIi0wU.png"} alt="" style={{ width:34, height:34, borderRadius:"50%", border:"1px solid var(--border)" }} />
                      <div>
                        <strong style={{ fontSize:"0.88rem" }}>{r.reviewer?.name}</strong>
                        <div style={{ marginTop:"2px" }}><StarRating rating={r.rating} /></div>
                      </div>
                    </div>
                    {r.comment && <p style={{ fontSize:"0.88rem", color:"var(--off-white)" }}>{r.comment}</p>}
                  </div>
                ))
              }
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem", position:"sticky", top:90 }}>
            {/* PRICE */}
            <div className="glass" style={{ padding:"2rem" }}>
              <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.72rem", color:"var(--muted)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"0.4rem" }}>Price</p>
              <p style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"2.8rem", color:"var(--white)", letterSpacing:"-0.05em", marginBottom:"0.3rem" }}>₹{skill.price}</p>
              <p style={{ fontSize:"0.82rem", color:"var(--muted)", marginBottom:"1.5rem" }}>{skill.mode==="barter" ? "Barter only" : skill.mode==="both" ? "Paid or barter" : "Fixed price"}</p>
              {!isOwner ? (
                <div style={{ display:"flex", flexDirection:"column", gap:"0.7rem" }}>
                  <button className="primary-btn" style={{ width:"100%", justifyContent:"center", padding:"0.9rem" }} onClick={() => setModal(true)}>
                    Send request
                  </button>
                  <button className="secondary-btn" style={{ width:"100%", justifyContent:"center", padding:"0.9rem" }} onClick={startChat}>
                    Message seller
                  </button>
                </div>
              ) : (
                <button className="secondary-btn" style={{ width:"100%", justifyContent:"center" }} onClick={() => navigate(`/edit-skill/${skill._id}`)}>
                  Edit this skill
                </button>
              )}
            </div>

            {/* SELLER */}
            <div className="glass" style={{ padding:"1.6rem" }}>
              <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.72rem", color:"var(--muted)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"1rem" }}>Seller</p>
              <div style={{ display:"flex", alignItems:"center", gap:"0.8rem", marginBottom:"1rem" }}>
                <img src={skill.user?.avatar||"https://i.imgur.com/HeIi0wU.png"} alt="" style={{ width:48, height:48, borderRadius:"50%", border:"2px solid var(--lime)", objectFit:"cover" }} />
                <div>
                  <strong style={{ display:"block", fontSize:"0.95rem" }}>{skill.user?.name}</strong>
                  <span style={{ fontSize:"0.78rem", color:"var(--muted)" }}>{skill.user?.headline || "Freelancer"}</span>
                </div>
              </div>
              {skill.user?.bio && <p style={{ fontSize:"0.83rem", color:"var(--off-white)", marginBottom:"1rem" }}>{skill.user.bio}</p>}
              {(skill.user?.rating > 0) && (
                <div style={{ display:"flex", gap:"0.8rem", marginBottom:"1rem" }}>
                  <span className="badge badge-lime">★ {skill.user.rating}</span>
                  <span className="badge badge-muted">{skill.user.totalReviews} reviews</span>
                </div>
              )}
              <button className="secondary-btn" style={{ width:"100%", justifyContent:"center", fontSize:"0.82rem" }} onClick={() => navigate(`/profile/${skill.user?._id}`)}>
                View profile →
              </button>
            </div>
          </div>
        </div>

        {/* MODAL */}
        {showModal && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:"1rem" }} onClick={e => e.target===e.currentTarget && setModal(false)}>
            <motion.div className="glass" initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} style={{ padding:"2.5rem", width:"100%", maxWidth:480 }}>
              <h2 style={{ marginBottom:"0.4rem" }}>Send Request</h2>
              <p style={{ fontSize:"0.85rem", color:"var(--muted)", marginBottom:"1.5rem" }}>Requesting: <span style={{ color:"var(--white)" }}>{skill.title}</span></p>
              <textarea value={reqMsg} onChange={e => setReqMsg(e.target.value)} placeholder="Add a message to the seller (optional)..." rows={4} style={{ marginBottom:"1.5rem" }} />
              <div style={{ display:"flex", gap:"0.7rem" }}>
                <button className="primary-btn" onClick={sendReq} disabled={sending} style={{ flex:1, justifyContent:"center" }}>
                  {sending ? "Sending..." : "Send request"}
                </button>
                <button className="secondary-btn" onClick={() => setModal(false)} style={{ flex:1, justifyContent:"center" }}>Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SkillDetail;
