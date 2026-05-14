import { useEffect, useState } from "react";
import { X } from "lucide-react";
import StarRating from "./StarRating";

const ReviewFormModal = ({ open, request, reviewee, onClose, onSubmit, submitting }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setRating(0);
    setComment("");
    setError("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const handleSubmit = () => {
    const trimmed = comment.trim();
    if (rating < 1 || rating > 5) {
      setError("Choose a rating between 1 and 5 stars.");
      return;
    }
    if (trimmed.length > 1000) {
      setError("Review comment must be under 1000 characters.");
      return;
    }
    onSubmit({ requestId: request._id, rating, comment: trimmed });
  };

  return (
    <div style={styles.backdrop} role="dialog" aria-modal="true">
      <div style={styles.modal} className="anim-scale">
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Completed request</p>
            <h3 style={styles.title}>Review {reviewee?.name || "this user"}</h3>
          </div>
          <button type="button" onClick={onClose} style={styles.close} aria-label="Close review modal">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.requestBox}>
            <span style={styles.requestTitle}>{request.skill?.title || "Skill request"}</span>
            <span style={styles.requestMeta}>{request.skill?.category || "Completed work"}</span>
          </div>

          <label style={styles.label}>Your rating</label>
          <StarRating rating={rating} onChange={setRating} size={30} />

          <label style={{ ...styles.label, marginTop: "1.1rem" }}>Review</label>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Share what went well, communication quality, and delivery experience..."
            rows={5}
            maxLength={1000}
            style={styles.textarea}
          />
          <div style={styles.footerLine}>
            <span style={styles.error}>{error}</span>
            <span style={styles.counter}>{comment.length}/1000</span>
          </div>
        </div>

        <div style={styles.actions}>
          <button type="button" className="secondary-btn" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="primary-btn" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 2000,
    background: "rgba(0,0,0,0.72)",
    backdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  },
  modal: {
    width: "min(540px, 100%)",
    maxHeight: "calc(100vh - 2rem)",
    overflowY: "auto",
    borderRadius: "var(--r-lg)",
    border: "1px solid var(--border)",
    background: "var(--surface-1)",
    boxShadow: "var(--shadow-lg)",
  },
  header: {
    padding: "1.25rem 1.25rem 1rem",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
  },
  eyebrow: {
    margin: 0,
    color: "var(--muted)",
    fontSize: "0.72rem",
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  title: {
    marginTop: "0.25rem",
    fontSize: "1.25rem",
  },
  close: {
    width: 34,
    height: 34,
    borderRadius: "var(--r-sm)",
    border: "1px solid var(--border)",
    background: "var(--surface-2)",
    color: "var(--off-white)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  body: {
    padding: "1.25rem",
  },
  requestBox: {
    padding: "0.9rem 1rem",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border)",
    background: "var(--surface-2)",
    marginBottom: "1rem",
  },
  requestTitle: {
    display: "block",
    color: "var(--white)",
    fontWeight: 800,
    fontSize: "0.95rem",
  },
  requestMeta: {
    display: "block",
    color: "var(--muted)",
    fontSize: "0.78rem",
    marginTop: 2,
  },
  label: {
    display: "block",
    color: "var(--off-white)",
    fontSize: "0.82rem",
    fontWeight: 700,
    marginBottom: "0.45rem",
  },
  textarea: {
    width: "100%",
    resize: "vertical",
  },
  footerLine: {
    minHeight: 22,
    marginTop: "0.45rem",
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
  },
  error: {
    color: "#f87171",
    fontSize: "0.78rem",
  },
  counter: {
    color: "var(--muted)",
    fontSize: "0.75rem",
    whiteSpace: "nowrap",
  },
  actions: {
    padding: "1rem 1.25rem 1.25rem",
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
};

export default ReviewFormModal;
