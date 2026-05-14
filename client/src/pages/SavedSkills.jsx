import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Heart, LoaderCircle, Search, Star } from "lucide-react";
import API from "../services/api";

/* ─── category color map ──────────────────────────────────────── */
const CAT_COLORS = {
  Design:       { bg: "rgba(200,116,42,0.12)",  text: "var(--accent-secondary)" },
  Development:  { bg: "rgba(42,124,111,0.12)",  text: "#5ecfbe" },
  Marketing:    { bg: "rgba(139,92,246,0.12)",  text: "#c4b5fd" },
  Writing:      { bg: "rgba(236,72,153,0.12)",  text: "#f9a8d4" },
  Video:        { bg: "rgba(59,130,246,0.12)",  text: "#93c5fd" },
  Photography:  { bg: "rgba(245,158,11,0.13)",  text: "#fcd34d" },
  Music:        { bg: "rgba(16,185,129,0.12)",  text: "#6ee7b7" },
  Finance:      { bg: "rgba(99,102,241,0.12)",  text: "#a5b4fc" },
};
const getCat = (cat) => CAT_COLORS[cat] || { bg: "rgba(200,116,42,0.1)", text: "var(--accent-secondary)" };

/* ─── Sort options ──────────────────────────────────────────── */
const SORTS = [
  { value: "default",   label: "Recently Saved" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc",label: "Price: High → Low" },
  { value: "rating",    label: "Top Rated" },
  { value: "az",        label: "A → Z" },
];

/* ─── Skeleton card ─────────────────────────────────────────── */
const SkeletonCard = () => (
  <div style={css.card}>
    <div style={{ padding: "1.4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.1rem" }}>
        <div className="skel-pulse" style={{ height: 26, width: 80, borderRadius: 999 }} />
        <div className="skel-pulse" style={{ width: 36, height: 36, borderRadius: "50%" }} />
      </div>
      <div className="skel-pulse" style={{ height: 22, width: "70%", borderRadius: 8, marginBottom: 10 }} />
      <div className="skel-pulse" style={{ height: 14, width: "100%", borderRadius: 6, marginBottom: 6 }} />
      <div className="skel-pulse" style={{ height: 14, width: "85%", borderRadius: 6, marginBottom: 20 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div className="skel-pulse" style={{ height: 32, width: 80, borderRadius: 8 }} />
        <div className="skel-pulse" style={{ height: 24, width: 60, borderRadius: 999 }} />
      </div>
      <div className="skel-pulse" style={{ height: 44, width: "100%", borderRadius: 14 }} />
    </div>
  </div>
);

/* ─── Empty state ────────────────────────────────────────────── */
const EmptyState = ({ filtered }) => {
  const navigate = useNavigate();
  return (
    <div style={css.emptyWrap}>
      {/* Decorative rings */}
      <div style={css.emptyRing1} />
      <div style={css.emptyRing2} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <div style={css.emptyIcon}>
          <Heart size={38} strokeWidth={1.8} style={{ color: "var(--accent-secondary)" }} />
        </div>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--text-primary)", margin: 0 }}>
          {filtered ? "No matches found" : "Your saved list is empty"}
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textAlign: "center", maxWidth: 340, lineHeight: 1.65 }}>
          {filtered
            ? "Try adjusting your filters or search query."
            : "Explore the marketplace and save skills you love. They'll appear here."}
        </p>
        {!filtered && (
          <button
            className="primary-btn"
            style={{ marginTop: "0.5rem" }}
            onClick={() => navigate("/skills")}
          >
            Explore Marketplace →
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Skill card ─────────────────────────────────────────────── */
const SavedCard = ({ skill, onRemove, removing }) => {
  const navigate = useNavigate();
  const catStyle = getCat(skill.category);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="saved-card"
      style={{
        ...css.card,
        transform: hovered ? "translateY(-6px) scale(1.015)" : "translateY(0) scale(1)",
        boxShadow: hovered
          ? "0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,116,42,0.22)"
          : "var(--shadow-primary)",
        borderColor: hovered ? "rgba(200,116,42,0.3)" : "var(--border-color)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top glow */}
      <div style={css.cardGlow} />

      <div style={{ padding: "1.4rem", position: "relative", zIndex: 1 }}>
        {/* Row: category + remove */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <span style={{ ...css.catBadge, background: catStyle.bg, color: catStyle.text }}>
            {skill.category}
          </span>
          <button
            onClick={() => onRemove(skill._id)}
            disabled={removing === skill._id}
            style={css.removeBtn(removing === skill._id)}
            title="Remove from saved"
            className="remove-btn"
          >
            {removing === skill._id ? (
              <LoaderCircle size={16} strokeWidth={2} />
            ) : (
              <Heart size={16} strokeWidth={2} fill="#ef4444" style={{ color: "#ef4444" }} />
            )}
          </button>
        </div>

        {/* Title */}
        <h3 style={css.cardTitle}>{skill.title}</h3>

        {/* Description */}
        <p style={css.cardDesc}>{skill.description}</p>

        {/* Seller row */}
        {skill.user && (
          <div style={css.sellerRow}>
            <img
              src={skill.user.avatar || "https://i.imgur.com/HeIi0wU.png"}
              alt={skill.user.name}
              style={css.sellerAvatar}
            />
            <span style={css.sellerName}>
              by <span style={{ color: "var(--accent-secondary)", fontWeight: 600 }}>{skill.user.name || "Creator"}</span>
            </span>
          </div>
        )}

        {/* Divider */}
        <div style={css.divider} />

        {/* Price + rating row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <span style={css.price}>₹{skill.price?.toLocaleString()}</span>
          <div style={css.ratingPill}>
            <Star size={13} strokeWidth={2} fill="var(--accent-secondary)" style={{ color: "var(--accent-secondary)" }} />
            {skill.rating || "5.0"}
          </div>
        </div>

        {/* CTA */}
        <button
          className="primary-btn"
          style={{ width: "100%", borderRadius: 14, padding: "0.72rem" }}
          onClick={() => navigate(`/skills/${skill._id}`)}
        >
          View Details →
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════ */
/*  SAVED SKILLS PAGE                                             */
/* ══════════════════════════════════════════════════════════════ */
const SavedSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [sort, setSort] = useState("default");
  const [filterCat, setFilterCat] = useState("All");
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await API.get("/auth/saved-skills", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSkills(data);
      } catch {
        toast.error("Failed to load saved skills");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleRemove = async (id) => {
    setRemoving(id);
    try {
      const token = localStorage.getItem("token");
      const { data } = await API.post(`/skills/save/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSkills((prev) => prev.filter((s) => s._id !== id));
      toast.success(data.message || "Removed from saved");
    } catch {
      toast.error("Failed to remove skill");
    } finally {
      setRemoving(null);
    }
  };

  /* ── derive categories ─────────────────────────────────────── */
  const categories = ["All", ...new Set(skills.map((s) => s.category).filter(Boolean))];

  /* ── filtered + sorted list ────────────────────────────────── */
  let displayed = skills.filter((s) => {
    const matchCat = filterCat === "All" || s.category === filterCat;
    const matchQ = !searchQ || s.title.toLowerCase().includes(searchQ.toLowerCase()) ||
      (s.description || "").toLowerCase().includes(searchQ.toLowerCase());
    return matchCat && matchQ;
  });

  if (sort === "price-asc") displayed = [...displayed].sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") displayed = [...displayed].sort((a, b) => b.price - a.price);
  else if (sort === "rating") displayed = [...displayed].sort((a, b) => (b.rating || 5) - (a.rating || 5));
  else if (sort === "az") displayed = [...displayed].sort((a, b) => a.title.localeCompare(b.title));

  const isFiltered = filterCat !== "All" || !!searchQ;

  return (
    <>
      <style>{STYLES}</style>

      <section style={css.page}>
        <div className="container">

          {/* ── Header ───────────────────────────────────────── */}
          <div style={css.header}>
            <div style={css.headerLeft}>
              <div style={css.heartIcon}>
                <Heart size={26} strokeWidth={2} fill="var(--accent-primary)" style={{ color: "var(--accent-primary)" }} />
              </div>
              <div>
                <h1 style={css.pageTitle}>Saved Skills</h1>
                <p style={css.pageSub}>
                  {loading ? "Loading…" : `${skills.length} skill${skills.length !== 1 ? "s" : ""} saved`}
                </p>
              </div>
            </div>

            {/* Search */}
            {!loading && skills.length > 0 && (
              <div style={{ position: "relative", width: 260 }}>
                <Search size={16} strokeWidth={2} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-secondary)" }} />
                <input
                  type="text"
                  placeholder="Search saved skills…"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  className="saved-search"
                  style={css.searchInput}
                />
              </div>
            )}
          </div>

          {/* ── Filter + Sort bar ────────────────────────────── */}
          {!loading && skills.length > 0 && (
            <div style={css.filterBar}>
              {/* Category pills */}
              <div style={css.catPills}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCat(cat)}
                    className={filterCat === cat ? "cat-pill active" : "cat-pill"}
                    style={{
                      ...css.catPill,
                      background: filterCat === cat ? "var(--gradient-primary)" : "rgba(255,245,230,0.04)",
                      color: filterCat === cat ? "#fff" : "var(--text-secondary)",
                      border: filterCat === cat ? "1px solid transparent" : "1px solid var(--border-color)",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort dropdown */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  style={css.sortSelect}
                  className="saved-sort"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ── Grid / Loading / Empty ───────────────────────── */}
          {loading ? (
            <div style={css.grid}>
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : displayed.length === 0 ? (
            <EmptyState filtered={isFiltered} />
          ) : (
            <>
              <div style={css.grid}>
                {displayed.map((skill) => (
                  <SavedCard
                    key={skill._id}
                    skill={skill}
                    onRemove={handleRemove}
                    removing={removing}
                  />
                ))}
              </div>
              <p style={css.resultCount}>
                Showing {displayed.length} of {skills.length} saved skills
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
};

/* ── styles ────────────────────────────────────────────────────── */
const css = {
  page: {
    minHeight: "100vh",
    paddingTop: "3.5rem",
    paddingBottom: "5rem",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-body)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "2.5rem",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  heartIcon: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "rgba(200,116,42,0.1)",
    border: "1px solid rgba(200,116,42,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: "2rem",
    fontWeight: 700,
    fontFamily: "var(--font-display)",
    color: "var(--text-primary)",
    marginBottom: 2,
    lineHeight: 1.2,
  },
  pageSub: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    marginBottom: 0,
  },
  searchInput: {
    width: "100%",
    background: "rgba(255,245,230,0.04)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    borderRadius: 12,
    padding: "0.62rem 1rem 0.62rem 2.2rem",
    fontSize: "0.85rem",
    outline: "none",
    transition: "var(--transition)",
    fontFamily: "var(--font-body)",
  },
  filterBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "0.75rem",
    marginBottom: "2rem",
    padding: "0.9rem 1.1rem",
    background: "rgba(255,245,230,0.03)",
    borderRadius: 16,
    border: "1px solid var(--border-color)",
  },
  catPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.45rem",
  },
  catPill: {
    padding: "0.35rem 0.85rem",
    borderRadius: 999,
    fontSize: "0.8rem",
    cursor: "pointer",
    transition: "var(--transition)",
    fontFamily: "var(--font-body)",
    fontWeight: 500,
  },
  sortSelect: {
    background: "rgba(255,245,230,0.04)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    borderRadius: 10,
    padding: "0.45rem 2rem 0.45rem 0.85rem",
    fontSize: "0.82rem",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    fontFamily: "var(--font-body)",
    transition: "var(--transition)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    background: "rgba(255,245,230,0.04)",
    border: "1px solid var(--border-color)",
    borderRadius: 22,
    position: "relative",
    overflow: "hidden",
    transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
  },
  cardGlow: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 130,
    height: 130,
    background: "rgba(200,116,42,0.07)",
    filter: "blur(40px)",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 0,
  },
  catBadge: {
    display: "inline-block",
    padding: "0.3rem 0.85rem",
    borderRadius: 999,
    fontSize: "0.76rem",
    fontWeight: 600,
    letterSpacing: "0.01em",
  },
  removeBtn: (loading) => ({
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)",
    cursor: loading ? "wait" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "var(--transition)",
    opacity: loading ? 0.6 : 1,
    flexShrink: 0,
  }),
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "0.55rem",
    lineHeight: 1.3,
    fontFamily: "var(--font-display)",
  },
  cardDesc: {
    fontSize: "0.84rem",
    color: "var(--text-secondary)",
    lineHeight: 1.65,
    marginBottom: "1rem",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  sellerRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    marginBottom: "0.9rem",
  },
  sellerAvatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid var(--border-color)",
    display: "block",
  },
  sellerName: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
  },
  divider: {
    height: 1,
    background: "var(--border-color)",
    marginBottom: "1rem",
  },
  price: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    fontFamily: "var(--font-display)",
    letterSpacing: "-0.02em",
  },
  ratingPill: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "rgba(255,245,230,0.06)",
    border: "1px solid var(--border-color)",
    borderRadius: 999,
    padding: "0.28rem 0.75rem",
    fontSize: "0.8rem",
    color: "var(--text-primary)",
    fontWeight: 500,
  },
  emptyWrap: {
    marginTop: "4rem",
    padding: "5rem 2rem",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  emptyRing1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: "50%",
    border: "1px solid rgba(200,116,42,0.08)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
  },
  emptyRing2: {
    position: "absolute",
    width: 480,
    height: 480,
    borderRadius: "50%",
    border: "1px solid rgba(200,116,42,0.05)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
  },
  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    background: "rgba(200,116,42,0.08)",
    border: "1px solid rgba(200,116,42,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.5rem",
  },
  resultCount: {
    textAlign: "center",
    fontSize: "0.82rem",
    color: "var(--text-secondary)",
    marginTop: "2rem",
  },
};

const STYLES = `
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
  .remove-btn:hover:not(:disabled) {
    background: rgba(239,68,68,0.18) !important;
    border-color: rgba(239,68,68,0.35) !important;
    transform: scale(1.1);
  }
  .cat-pill:hover {
    border-color: rgba(200,116,42,0.4) !important;
    color: var(--accent-secondary) !important;
  }
  .saved-search:focus {
    border-color: rgba(200,116,42,0.45) !important;
    background: rgba(200,116,42,0.04) !important;
    box-shadow: 0 0 0 3px rgba(200,116,42,0.1) !important;
  }
  .saved-sort:focus {
    border-color: rgba(200,116,42,0.45) !important;
  }
  @media (max-width: 600px) {
    .saved-header-search { display: none; }
  }
`;

export default SavedSkills;
