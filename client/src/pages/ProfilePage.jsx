import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import RatingSummary from "../components/RatingSummary";
import ReviewCard from "../components/ReviewCard";
import StarRating from "../components/StarRating";

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [profileResponse, reviewResponse] = await Promise.all([
          API.get(`/users/profile/${id}`),
          API.get(`/reviews/user/${id}`),
        ]);
        setUser(profileResponse.data);
        setReviews(reviewResponse.data.reviews || []);
        setSummary(reviewResponse.data.summary || { averageRating: 0, totalReviews: 0 });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="glass" style={styles.centerCard}>
            <h2>Loading...</h2>
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="section">
        <div className="container">
          <div className="glass" style={styles.centerCard}>
            <h2 style={{ color: "#f87171" }}>User not found</h2>
          </div>
        </div>
      </section>
    );
  }

  const averageRating = summary.averageRating || user.rating || 0;
  const totalReviews = summary.totalReviews || user.totalReviews || 0;

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 980 }}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          Back
        </button>

        <div className="glass" style={styles.hero}>
          <div style={styles.heroContent}>
            <img
              src={user.avatar || "https://i.imgur.com/HeIi0wU.png"}
              alt={user.name}
              onError={(event) => {
                event.currentTarget.src = "https://i.imgur.com/HeIi0wU.png";
              }}
              style={styles.avatar}
            />

            <div style={styles.info}>
              <div style={styles.nameRow}>
                <h1 style={styles.name}>{user.name}</h1>
                {user.openToWork && <span style={styles.openBadge}>Open to Work</span>}
              </div>

              <p style={styles.headline}>{user.headline || "Freelancer"}</p>

              <div style={styles.metaRow}>
                {user.location && <span>{user.location}</span>}
                {user.experienceLevel && <span style={styles.levelBadge}>{user.experienceLevel}</span>}
              </div>

              <div style={styles.ratingLine}>
                <StarRating rating={Math.round(averageRating)} size={17} disabled />
                <span style={styles.ratingText}>
                  {Number(averageRating).toFixed(1)} ({totalReviews} review{totalReviews === 1 ? "" : "s"})
                </span>
              </div>

              <div style={styles.reputationLine}>
                <span style={styles.reputationPill}>{user.activityLevel || "Emerging"}</span>
                <span style={styles.reputationText}>{user.xp || 0} XP</span>
                <span style={styles.reputationText}>{user.reputationScore || 0} reputation</span>
              </div>

              {(user.github || user.linkedin || user.portfolio) && (
                <div style={styles.links}>
                  {user.github && (
                    <a href={user.github} target="_blank" rel="noreferrer" style={styles.linkButton}>
                      GitHub
                    </a>
                  )}
                  {user.linkedin && (
                    <a href={user.linkedin} target="_blank" rel="noreferrer" style={styles.linkButton}>
                      LinkedIn
                    </a>
                  )}
                  {user.portfolio && (
                    <a href={user.portfolio} target="_blank" rel="noreferrer" style={styles.primaryLink}>
                      Portfolio
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.grid}>
          <div style={styles.leftColumn}>
            <RatingSummary averageRating={averageRating} totalReviews={totalReviews} />

            {user.bio && (
              <div className="glass" style={styles.sectionCard}>
                <h2 style={styles.sectionTitle}>About</h2>
                <p style={styles.bodyCopy}>{user.bio}</p>
              </div>
            )}

            <div className="glass" style={styles.sectionCard}>
              <h2 style={styles.sectionTitle}>Skills</h2>
              {user.skills?.length > 0 ? (
                <div style={styles.skills}>
                  {user.skills.map((skill) => (
                    <span key={skill} style={styles.skillPill}>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={styles.muted}>No skills added yet.</p>
              )}
            </div>

            <div className="glass" style={styles.sectionCard}>
              <h2 style={styles.sectionTitle}>Badges</h2>
              {user.badges?.length > 0 ? (
                <div style={styles.badges}>
                  {user.badges.slice(0, 8).map((badge) => (
                    <span key={badge.key} style={styles.badgePill} title={badge.description}>
                      {badge.label}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={styles.muted}>No badges earned yet.</p>
              )}
            </div>
          </div>

          <div className="glass" style={styles.reviewsPanel}>
            <div style={styles.reviewsHeader}>
              <div>
                <p style={styles.eyebrow}>Reviews</p>
                <h2 style={styles.sectionTitle}>Client Feedback</h2>
              </div>
              <span style={styles.reviewCount}>{totalReviews}</span>
            </div>

            {reviews.length === 0 ? (
              <div style={styles.emptyReviews}>
                <h3 style={{ marginBottom: "0.35rem" }}>No reviews yet</h3>
                <p style={styles.muted}>Completed work reviews will appear here.</p>
              </div>
            ) : (
              <div style={styles.reviewList}>
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const styles = {
  centerCard: {
    padding: "3rem",
    textAlign: "center",
  },
  backButton: {
    background: "none",
    border: "none",
    color: "var(--text-secondary, #aaa)",
    cursor: "pointer",
    fontSize: "0.9rem",
    marginBottom: "1.5rem",
    padding: 0,
  },
  hero: {
    padding: "2.5rem",
    marginBottom: "1.5rem",
  },
  heroContent: {
    display: "flex",
    gap: "2rem",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  avatar: {
    width: 112,
    height: 112,
    minWidth: 112,
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid var(--accent-primary)",
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 220,
  },
  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
    marginBottom: "0.4rem",
  },
  name: {
    fontSize: "2rem",
    margin: 0,
  },
  openBadge: {
    fontSize: "0.78rem",
    fontWeight: 700,
    padding: "0.25rem 0.75rem",
    borderRadius: 999,
    background: "rgba(74,222,128,0.12)",
    color: "#4ade80",
    border: "1px solid rgba(74,222,128,0.3)",
  },
  headline: {
    color: "var(--accent-secondary)",
    fontWeight: 600,
    marginBottom: "0.5rem",
  },
  metaRow: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    fontSize: "0.88rem",
    color: "var(--text-secondary, #aaa)",
    marginBottom: "0.9rem",
  },
  levelBadge: {
    padding: "0.2rem 0.7rem",
    borderRadius: 999,
    background: "rgba(200,241,53,0.12)",
    color: "var(--accent-secondary)",
    border: "1px solid rgba(200,241,53,0.25)",
  },
  ratingLine: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },
  ratingText: {
    color: "var(--off-white)",
    fontSize: "0.86rem",
    fontWeight: 700,
  },
  reputationLine: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },
  reputationPill: {
    padding: "0.24rem 0.7rem",
    borderRadius: 999,
    background: "rgba(99,102,241,0.14)",
    color: "#a5b4fc",
    border: "1px solid rgba(99,102,241,0.24)",
    fontSize: "0.78rem",
    fontWeight: 800,
  },
  reputationText: {
    color: "var(--muted)",
    fontSize: "0.8rem",
    fontWeight: 700,
  },
  links: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  linkButton: {
    padding: "0.45rem 1.1rem",
    borderRadius: 10,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "inherit",
    textDecoration: "none",
    fontSize: "0.88rem",
  },
  primaryLink: {
    padding: "0.45rem 1.1rem",
    borderRadius: 10,
    background: "var(--accent-primary)",
    color: "#080808",
    textDecoration: "none",
    fontSize: "0.88rem",
    fontWeight: 800,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
    gap: "1.5rem",
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    minWidth: 0,
  },
  sectionCard: {
    padding: "2rem",
  },
  sectionTitle: {
    marginBottom: "1rem",
    fontSize: "1.2rem",
  },
  bodyCopy: {
    lineHeight: 1.7,
    color: "var(--off-white)",
  },
  skills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  skillPill: {
    padding: "0.35rem 0.85rem",
    borderRadius: 999,
    background: "rgba(200,241,53,0.12)",
    color: "var(--accent-secondary)",
    border: "1px solid rgba(200,241,53,0.25)",
    fontSize: "0.88rem",
  },
  badges: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  badgePill: {
    padding: "0.38rem 0.85rem",
    borderRadius: 999,
    background: "rgba(99,102,241,0.12)",
    color: "#a5b4fc",
    border: "1px solid rgba(99,102,241,0.22)",
    fontSize: "0.82rem",
    fontWeight: 800,
  },
  muted: {
    color: "var(--muted)",
    fontSize: "0.9rem",
  },
  reviewsPanel: {
    padding: "1.5rem",
    alignSelf: "start",
    minWidth: 0,
  },
  reviewsHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  eyebrow: {
    margin: 0,
    fontFamily: "var(--font-mono)",
    fontSize: "0.72rem",
    color: "var(--muted)",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  reviewCount: {
    minWidth: 36,
    height: 36,
    paddingInline: "0.6rem",
    borderRadius: "var(--r-full)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--lime)",
    color: "var(--ink)",
    fontWeight: 900,
  },
  emptyReviews: {
    padding: "3rem 1rem",
    textAlign: "center",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border)",
    background: "var(--surface-2)",
  },
  reviewList: {
    display: "grid",
    gap: "1rem",
  },
};

export default ProfilePage;
