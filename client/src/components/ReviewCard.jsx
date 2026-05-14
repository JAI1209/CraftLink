import StarRating from "./StarRating";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const ReviewCard = ({ review }) => {
  const skill = review.request?.skill;

  return (
    <article className="glass" style={styles.card}>
      <div style={styles.top}>
        <div style={styles.author}>
          <img
            src={review.reviewer?.avatar || "https://i.imgur.com/HeIi0wU.png"}
            alt={review.reviewer?.name || "Reviewer"}
            style={styles.avatar}
          />
          <div style={{ minWidth: 0 }}>
            <h4 style={styles.name}>{review.reviewer?.name || "CraftLink user"}</h4>
            <p style={styles.meta}>
              {skill?.title || "Completed request"}
              {skill?.category ? ` · ${skill.category}` : ""}
            </p>
          </div>
        </div>
        <span style={styles.date}>{formatDate(review.createdAt)}</span>
      </div>

      <StarRating rating={review.rating} size={17} disabled />

      {review.comment ? (
        <p style={styles.comment}>{review.comment}</p>
      ) : (
        <p style={styles.emptyComment}>No written comment.</p>
      )}
    </article>
  );
};

const styles = {
  card: {
    padding: "1.2rem",
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "0.9rem",
  },
  author: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    minWidth: 0,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid var(--border)",
    flexShrink: 0,
  },
  name: {
    margin: 0,
    color: "var(--white)",
    fontSize: "0.95rem",
  },
  meta: {
    margin: "0.15rem 0 0",
    color: "var(--muted)",
    fontSize: "0.78rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  date: {
    color: "var(--muted)",
    fontSize: "0.72rem",
    whiteSpace: "nowrap",
  },
  comment: {
    marginTop: "0.85rem",
    color: "var(--off-white)",
    fontSize: "0.9rem",
    lineHeight: 1.7,
  },
  emptyComment: {
    marginTop: "0.85rem",
    color: "var(--muted)",
    fontSize: "0.85rem",
    fontStyle: "italic",
  },
};

export default ReviewCard;
