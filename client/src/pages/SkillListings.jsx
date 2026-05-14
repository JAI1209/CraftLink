import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import SkillCard from "../components/SkillCard";
import SkeletonCard from "../components/SkeletonCard";

const CATS = ["All","Development","Design","Marketing","Editing","UI/UX","Writing","Video","Music","Other"];

const SkillListings = () => {
  const [skills, setSkills]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    API.get("/skills", { params: { limit: 60 } })
      .then(({ data }) => setSkills(data.skills || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => skills.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.title.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
    const matchC = category === "All" || s.category === category;
    return matchQ && matchC;
  }), [skills, search, category]);

  return (
    <section className="section">
      <div className="container">
        {/* PAGE HEADER */}
        <div style={{ marginBottom:"2.5rem" }}>
          <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.75rem", color:"var(--muted)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"0.6rem" }}>Marketplace</p>
          <h1 style={{ marginBottom:"0.8rem" }}>Explore Skills</h1>
          <p>Browse {skills.length}+ listings from verified freelancers.</p>
        </div>

        {/* SEARCH */}
        <div style={{ marginBottom:"1.5rem" }}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills, categories, keywords..." style={{ maxWidth:520, background:"var(--surface-2)" }} />
        </div>

        {/* CATEGORY PILLS */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem", marginBottom:"2.5rem" }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding:"0.4rem 1.1rem", borderRadius:"var(--r-full)", cursor:"pointer",
              fontFamily:"var(--font-mono)", fontSize:"0.75rem", letterSpacing:"0.04em",
              border: category===c ? "1px solid rgba(200,241,53,0.4)" : "1px solid var(--border)",
              background: category===c ? "var(--lime-dim)" : "transparent",
              color: category===c ? "var(--lime)" : "var(--muted)",
              transition:"all 0.15s",
            }}>{c}</button>
          ))}
        </div>

        {/* RESULTS */}
        <p style={{ fontFamily:"var(--font-mono)", fontSize:"0.75rem", color:"var(--muted)", marginBottom:"1.5rem", letterSpacing:"0.04em" }}>
          {loading ? "Loading..." : `${filtered.length} results`}
        </p>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:"1.2rem" }}>
          {loading
            ? Array(9).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : filtered.length > 0
              ? filtered.map(s => (
                  <SkillCard key={s._id} _id={s._id} title={s.title} category={s.category}
                    description={s.description} price={s.price} rating={s.rating}
                    username={s.user?.name || "Creator"} userId={s.user?._id} avatar={s.user?.avatar} />
                ))
              : (
                <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"5rem 0" }}>
                  <p style={{ fontSize:"2rem", marginBottom:"1rem" }}>◻</p>
                  <h3 style={{ marginBottom:"0.5rem" }}>No results found</h3>
                  <p>Try a different search or category.</p>
                </div>
              )
          }
        </div>
      </div>
    </section>
  );
};

export default SkillListings;
