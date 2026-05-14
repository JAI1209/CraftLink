import StarRating from "./StarRating";

const RatingSummary = ({ averageRating = 0, totalReviews = 0 }) => {
  const rounded = Number(averageRating || 0);

  return (
    <div className="glass" style={styles.card}>
      <div>
        <p style={styles.eyebrow}>Rating</p>
        <div style={styles.scoreRow}>
          <span style={styles.score}>{rounded.toFixed(1)}</span>
          <StarRating rating={Math.round(rounded)} size={18} disabled />
        </div>
        <p style={styles.copy}>
          Based on {totalReviews} review{totalReviews === 1 ? "" : "s"}
        </p>
      </div>
      <div style={styles.stat}>
        <span style={styles.statValue}>{totalReviews}</span>
        <span style={styles.statLabel}>total reviews</span>
      </div>
    </div>
  );
};

const styles = {
  card: {
    padding: "1.35rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  eyebrow: {
    margin: 0,
    color: "var(--muted)",
    fontSize: "0.72rem",
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  scoreRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.7rem",
    marginTop: "0.3rem",
  },
  score: {
    fontSize: "2.1rem",
    lineHeight: 1,
    color: "var(--white)",
    fontFamily: "var(--font-display)",
    fontWeight: 800,
  },
  copy: {
    marginTop: "0.45rem",
    color: "var(--off-white)",
    fontSize: "0.86rem",
  },
  stat: {
    minWidth: 120,
    padding: "0.9rem 1rem",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border)",
    background: "var(--surface-2)",
    textAlign: "center",
  },
  statValue: {
    display: "block",
    color: "var(--lime)",
    fontSize: "1.5rem",
    fontFamily: "var(--font-display)",
    fontWeight: 800,
  },
  statLabel: {
    display: "block",
    color: "var(--muted)",
    fontSize: "0.72rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
};

export default RatingSummary;
