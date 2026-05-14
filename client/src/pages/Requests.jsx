import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import API from "../services/api";
import ReviewFormModal from "../components/ReviewFormModal";

const STATUS_BADGE = {
  pending: "badge-yellow",
  accepted: "badge-green",
  rejected: "badge-red",
  completed: "badge-indigo",
};

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const RequestCard = ({ request, type, reviewedRequests, onAction, onReviewClick }) => {
  const other = type === "sent" ? request.to : request.from;
  const canReview = type === "sent" && request.status === "completed";
  const alreadyReviewed = reviewedRequests.has(request._id);

  const act = async (action) => {
    try {
      await API.put(`/requests/${request._id}/${action}`, {}, authConfig());
      toast.success(action === "complete" ? "Request completed" : `Request ${action}ed`);
      onAction();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  return (
    <motion.article
      className="glass"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.card}
    >
      <div style={styles.top}>
        <div style={styles.person}>
          <img
            src={other?.avatar || "https://i.imgur.com/HeIi0wU.png"}
            alt={other?.name || "User"}
            style={styles.avatar}
          />
          <div style={{ minWidth: 0 }}>
            <strong style={styles.personName}>{other?.name || "User"}</strong>
            <span style={styles.personMeta}>
              {type === "sent" ? "Requested from" : "Request from"} {other?.name || "CraftLink user"}
            </span>
          </div>
        </div>
        <span className={`badge ${STATUS_BADGE[request.status] || "badge-muted"}`}>
          {request.status}
        </span>
      </div>

      <h4 style={styles.skillTitle}>{request.skill?.title || "Skill request"}</h4>
      <p style={styles.category}>{request.skill?.category || "General"}</p>
      <p style={styles.amount}>{formatMoney(request.amount)}</p>

      {request.message && (
        <div style={styles.message}>
          "{request.message}"
        </div>
      )}

      <p style={styles.date}>
        {new Date(request.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>

      <div style={styles.actions}>
        {type === "received" && request.status === "pending" && (
          <>
            <button className="primary-btn" style={styles.actionButton} onClick={() => act("accept")}>
              Accept
            </button>
            <button className="secondary-btn" style={styles.actionButton} onClick={() => act("reject")}>
              Reject
            </button>
          </>
        )}

        {request.status === "accepted" && (
          <button className="primary-btn" style={styles.actionButton} onClick={() => act("complete")}>
            Mark complete
          </button>
        )}

        {canReview && (
          <button
            className={alreadyReviewed ? "secondary-btn" : "primary-btn"}
            style={styles.actionButton}
            onClick={() => !alreadyReviewed && onReviewClick(request)}
            disabled={alreadyReviewed}
          >
            {alreadyReviewed ? "Reviewed" : "Leave review"}
          </button>
        )}
      </div>
    </motion.article>
  );
};

const Requests = () => {
  const [tab, setTab] = useState("received");
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [reviewedRequests, setReviewedRequests] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadReviewedRequests = useCallback(async (requests) => {
    const completed = requests.filter((request) => request.status === "completed");
    if (completed.length === 0) {
      setReviewedRequests(new Set());
      return;
    }

    const requestIds = completed.map((request) => request._id).join(",");
    const { data } = await API.get(`/reviews/mine?requestIds=${requestIds}`, authConfig());
    setReviewedRequests(new Set(data.reviewedRequestIds || []));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sentResponse, receivedResponse] = await Promise.all([
        API.get("/requests/sent", authConfig()),
        API.get("/requests/received", authConfig()),
      ]);
      setSent(sentResponse.data);
      setReceived(receivedResponse.data);
      await loadReviewedRequests(sentResponse.data);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [loadReviewedRequests]);

  useEffect(() => {
    load();
  }, [load]);

  const current = useMemo(
    () => (tab === "sent" ? sent : received),
    [received, sent, tab]
  );

  const submitReview = async (payload) => {
    setSubmittingReview(true);
    try {
      await API.post("/reviews", payload, authConfig());
      setReviewedRequests((prev) => new Set(prev).add(payload.requestId));
      setReviewTarget(null);
      toast.success("Review submitted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div style={styles.heading}>
          <p style={styles.eyebrow}>Requests</p>
          <h1>Skill Requests</h1>
        </div>

        <div style={styles.tabs}>
          {[
            ["received", `Received (${received.length})`],
            ["sent", `Sent (${sent.length})`],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              style={{
                ...styles.tab,
                background: tab === value ? "var(--lime)" : "transparent",
                color: tab === value ? "#080808" : "var(--muted)",
                fontWeight: tab === value ? 700 : 500,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={styles.grid}>
            {[1, 2, 3].map((item) => (
              <div key={item} className="skeleton" style={styles.skeleton} />
            ))}
          </div>
        ) : current.length === 0 ? (
          <div className="glass" style={styles.empty}>
            <p style={styles.emptyIcon}>-</p>
            <h3 style={{ marginBottom: "0.5rem" }}>No {tab} requests</h3>
            <p style={{ fontSize: "0.88rem" }}>
              {tab === "sent"
                ? "Browse skills and send your first request."
                : "Requests from others will appear here."}
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {current.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                type={tab}
                reviewedRequests={reviewedRequests}
                onAction={load}
                onReviewClick={setReviewTarget}
              />
            ))}
          </div>
        )}
      </div>

      <ReviewFormModal
        open={Boolean(reviewTarget)}
        request={reviewTarget}
        reviewee={reviewTarget?.to}
        submitting={submittingReview}
        onClose={() => setReviewTarget(null)}
        onSubmit={submitReview}
      />
    </section>
  );
};

const styles = {
  heading: {
    marginBottom: "2.5rem",
  },
  eyebrow: {
    fontFamily: "var(--font-mono)",
    fontSize: "0.75rem",
    color: "var(--muted)",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: "0.6rem",
  },
  tabs: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "2rem",
    padding: "0.4rem",
    background: "var(--surface-2)",
    borderRadius: "var(--r-md)",
    width: "fit-content",
    maxWidth: "100%",
    flexWrap: "wrap",
  },
  tab: {
    padding: "0.55rem 1.2rem",
    borderRadius: "var(--r-sm)",
    border: "none",
    fontFamily: "var(--font-body)",
    fontSize: "0.85rem",
    transition: "all 0.15s",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))",
    gap: "1.2rem",
  },
  skeleton: {
    height: 220,
    borderRadius: "var(--r-lg)",
  },
  empty: {
    padding: "5rem 1.5rem",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: "2rem",
    marginBottom: "1rem",
  },
  card: {
    padding: "1.6rem",
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.2rem",
    flexWrap: "wrap",
    gap: "0.8rem",
  },
  person: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    minWidth: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "1.5px solid var(--border)",
    objectFit: "cover",
    flexShrink: 0,
  },
  personName: {
    display: "block",
    fontSize: "0.92rem",
    color: "var(--white)",
  },
  personMeta: {
    display: "block",
    fontSize: "0.75rem",
    color: "var(--muted)",
    fontFamily: "var(--font-mono)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  skillTitle: {
    marginBottom: "0.3rem",
  },
  category: {
    fontSize: "0.82rem",
    color: "var(--muted)",
    marginBottom: "0.4rem",
  },
  amount: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "1.3rem",
    color: "var(--white)",
    marginBottom: "0.8rem",
    letterSpacing: "-0.03em",
  },
  message: {
    padding: "0.8rem 1rem",
    background: "var(--surface-2)",
    borderRadius: "var(--r-md)",
    marginBottom: "0.8rem",
    fontSize: "0.85rem",
    color: "var(--off-white)",
    fontStyle: "italic",
    borderLeft: "2px solid var(--border-hi)",
  },
  date: {
    fontSize: "0.72rem",
    color: "var(--subtle)",
    fontFamily: "var(--font-mono)",
    marginBottom: "1.2rem",
  },
  actions: {
    display: "flex",
    gap: "0.6rem",
    flexWrap: "wrap",
  },
  actionButton: {
    padding: "0.55rem 1rem",
    fontSize: "0.82rem",
  },
};

export default Requests;
