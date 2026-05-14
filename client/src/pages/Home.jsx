import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import SkillCard from "../components/SkillCard";
import API from "../services/api";

const CATS = [
  { name:"Development", icon:"⌨" },
  { name:"Design", icon:"◈" },
  { name:"Video", icon:"▶" },
  { name:"Marketing", icon:"◉" },
  { name:"Writing", icon:"✦" },
  { name:"UI/UX", icon:"⬡" },
];

const STATS = [
  { num:"12K+",  label:"Active Freelancers" },
  { num:"31K+",  label:"Skills Exchanged" },
  { num:"4.9",   label:"Community Rating" },
  { num:"120+",  label:"Categories" },
];

const Home = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const heroRef = useRef(null);

  useEffect(() => {
    API.get("/skills", { params: { limit: 6 } })
      .then(({ data }) => setFeatured((data.skills || data).slice(0, 6)))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* ── HERO ── */}
      <section style={{ paddingBlock: "clamp(5rem,12vw,10rem) clamp(4rem,8vw,7rem)", position: "relative", overflow: "hidden" }}>
        {/* BG grid */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(248,246,242,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(248,246,242,0.04) 1px,transparent 1px)", backgroundSize:"64px 64px", pointerEvents:"none", maskImage:"radial-gradient(ellipse 80% 60% at 50% 0%,#000 40%,transparent 100%)" }} />
        {/* Lime glow */}
        <div style={{ position:"absolute", top:"-200px", left:"50%", transform:"translateX(-50%)", width:600, height:600, background:"radial-gradient(ellipse at 50% 40%,rgba(200,241,53,0.12) 0%,transparent 65%)", pointerEvents:"none" }} />

        <div className="container">
          <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}
            style={{ maxWidth:820, margin:"0 auto", textAlign:"center" }}>
            {/* PILL TAG */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", padding:"0.4rem 1rem", borderRadius:"var(--r-full)", border:"1px solid rgba(200,241,53,0.25)", background:"rgba(200,241,53,0.07)", marginBottom:"2.5rem" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--lime)", display:"inline-block", animation:"pulse 2s infinite" }} />
              <span style={{ fontSize:"0.78rem", fontFamily:"var(--font-mono)", color:"var(--lime)", letterSpacing:"0.06em" }}>NOW LIVE — v1.0</span>
            </div>

            <h1 style={{ marginBottom:"1.5rem", lineHeight:1.05 }}>
              The marketplace for<br />
              <span style={{ WebkitTextStroke:"1px rgba(248,246,242,0.2)", color:"transparent", WebkitTextFillColor:"transparent", WebkitBackgroundClip:"text", backgroundClip:"text", backgroundImage:"none", position:"relative" }}>
                <span style={{ color:"var(--lime)" }}>craft</span>
              </span>
              {" "}and skill.
            </h1>
            <p style={{ fontSize:"1.1rem", maxWidth:560, margin:"0 auto 3rem", color:"var(--off-white)", lineHeight:1.8 }}>
              Exchange expertise, collaborate on projects, and build your professional network — all on one platform.
            </p>
            <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
              <button className="primary-btn" onClick={() => navigate("/register")} style={{ padding:"0.95rem 2rem", fontSize:"0.95rem" }}>
                Start for free →
              </button>
              <button className="secondary-btn" onClick={() => navigate("/skills")} style={{ padding:"0.95rem 2rem", fontSize:"0.95rem" }}>
                Browse skills
              </button>
            </div>
          </motion.div>

          {/* STATS ROW */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35, duration:0.7, ease:[0.16,1,0.3,1] }}
            style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1px", background:"var(--border)", borderRadius:"var(--r-lg)", overflow:"hidden", marginTop:"5rem", border:"1px solid var(--border)" }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ padding:"2rem", textAlign:"center", background:"var(--surface-1)" }}>
                <p style={{ fontFamily:"var(--font-display)", fontSize:"2.2rem", fontWeight:800, color:"var(--white)", marginBottom:"0.3rem", letterSpacing:"-0.04em" }}>{s.num}</p>
                <p style={{ fontSize:"0.8rem", color:"var(--muted)", fontFamily:"var(--font-mono)", letterSpacing:"0.04em" }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section" style={{ paddingTop:0 }}>
        <div className="container">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:"4rem", alignItems:"center" }}>
            <div>
              <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.75rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--lime)", marginBottom:"1rem" }}>Process</p>
              <h2 style={{ marginBottom:"1.2rem" }}>Three steps to your next collab.</h2>
              <p>CraftLink removes friction from skill exchange — find people, send a request, start working.</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"1px" }}>
              {[
                { n:"01", title:"Create your profile", desc:"Showcase skills you have and skills you need. Upload your portfolio and set your availability." },
                { n:"02", title:"Discover & connect", desc:"Browse hundreds of listings. Filter by category, type, or mode. Send a request in one click." },
                { n:"03", title:"Collaborate & grow", desc:"Chat in real-time, exchange skills or pay, then leave a review to build your reputation." },
              ].map((step, i) => (
                <motion.div key={i} whileHover={{ x: 6 }} transition={{ duration: 0.2 }}
                  style={{ display:"flex", gap:"2rem", padding:"2rem", background:"var(--surface-1)", borderRadius:i===0?"var(--r-lg) var(--r-lg) 0 0":i===2?"0 0 var(--r-lg) var(--r-lg)":"0", border:"1px solid var(--border)", borderBottom: i<2 ? "none":"1px solid var(--border)", alignItems:"flex-start" }}>
                  <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.75rem", color:"var(--muted)", flexShrink:0, paddingTop:"0.2rem" }}>{step.n}</span>
                  <div>
                    <h4 style={{ marginBottom:"0.5rem", color:"var(--white)" }}>{step.title}</h4>
                    <p style={{ fontSize:"0.88rem", color:"var(--muted)", lineHeight:1.7 }}>{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section" style={{ paddingTop:0 }}>
        <div className="container">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"2.5rem", flexWrap:"wrap", gap:"1rem" }}>
            <div>
              <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.75rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--muted)", marginBottom:"0.6rem" }}>Categories</p>
              <h2>Browse by discipline.</h2>
            </div>
            <button className="secondary-btn" onClick={() => navigate("/skills")} style={{ fontSize:"0.82rem" }}>View all →</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"1rem" }} className="stagger">
            {CATS.map((c, i) => (
              <motion.div key={i} className="glass anim-up" whileHover={{ y:-6, borderColor:"var(--border-hi)" }}
                style={{ padding:"2rem 1.5rem", cursor:"pointer", textAlign:"center" }}
                onClick={() => navigate(`/skills?category=${c.name}`)}>
                <div style={{ fontSize:"2rem", marginBottom:"0.8rem", fontStyle:"normal", lineHeight:1 }}>{c.icon}</div>
                <p style={{ fontFamily:"var(--font-display)", fontSize:"0.9rem", fontWeight:600, color:"var(--white)" }}>{c.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ── */}
      <section className="section" style={{ paddingTop:0 }}>
        <div className="container">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"2.5rem", flexWrap:"wrap", gap:"1rem" }}>
            <div>
              <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.75rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--muted)", marginBottom:"0.6rem" }}>Featured</p>
              <h2>Fresh listings from the community.</h2>
            </div>
            <button className="secondary-btn" onClick={() => navigate("/skills")} style={{ fontSize:"0.82rem" }}>Browse all →</button>
          </div>
          {featured.length > 0 ? (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"1.2rem" }}>
              {featured.map(skill => (
                <SkillCard key={skill._id} _id={skill._id} title={skill.title} category={skill.category}
                  description={skill.description} price={skill.price} rating={skill.rating}
                  username={skill.user?.name || "Creator"} userId={skill.user?._id} avatar={skill.user?.avatar} />
              ))}
            </div>
          ) : (
            <div className="glass" style={{ padding:"4rem", textAlign:"center" }}>
              <p style={{ marginBottom:"1rem" }}>No skills listed yet.</p>
              <button className="primary-btn" onClick={() => navigate("/register")}>Be the first</button>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="section" style={{ paddingTop:0 }}>
        <div className="container">
          <div style={{ position:"relative", borderRadius:"var(--r-xl)", overflow:"hidden", background:"var(--surface-1)", border:"1px solid var(--border)", padding:"clamp(3rem,6vw,5rem)" }}>
            {/* BG accent */}
            <div style={{ position:"absolute", top:"-80px", right:"-80px", width:400, height:400, background:"radial-gradient(circle,rgba(200,241,53,0.1) 0%,transparent 65%)", pointerEvents:"none" }} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"3rem", alignItems:"center", flexWrap:"wrap" }}>
              <div>
                <h2 style={{ marginBottom:"1rem" }}>Ready to link your craft?</h2>
                <p style={{ color:"var(--off-white)", fontSize:"1rem", maxWidth:500 }}>Join thousands of creatives and developers exchanging skills and building real products together.</p>
              </div>
              <div style={{ display:"flex", gap:"0.8rem", flexWrap:"wrap" }}>
                <button className="primary-btn" onClick={() => navigate("/register")} style={{ padding:"1rem 2rem" }}>Get started</button>
                <button className="secondary-btn" onClick={() => navigate("/skills")} style={{ padding:"1rem 2rem" }}>Explore</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
