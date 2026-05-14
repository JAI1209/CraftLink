import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { BadgeCheck, Clock, Send, Trophy, Users, X } from "lucide-react";
import API from "../services/api";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";

const authHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });
const splitLinks = (value) => value.split(",").map((item) => item.trim()).filter(Boolean);

const getCountdown = (date) => {
  if (!date) return "Flexible";
  const ms = new Date(date).getTime() - Date.now();
  if (ms <= 0) return "Ended";
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h left`;
  return `${hours}h left`;
};

const ChallengeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [submission, setSubmission] = useState({ title: "", description: "", links: "" });
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(Date.now());

  const joined = challenge?.participants?.some((item) => item.user?._id === user?._id);
  const leaderboard = useMemo(
    () => [...(challenge?.participants || [])].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 8),
    [challenge]
  );

  const loadChallenge = async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/challenges/${id}`, authHeaders(token));
      setChallenge(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load challenge");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenge();
  }, [id, token]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!id) return;
    const handleUpdate = ({ challenge: nextChallenge }) => {
      if (nextChallenge?._id === id) setChallenge(nextChallenge);
    };
    socket.emit("challenge:join", { challengeId: id });
    socket.on("challenge:updated", handleUpdate);
    return () => {
      socket.emit("challenge:leave", { challengeId: id });
      socket.off("challenge:updated", handleUpdate);
    };
  }, [id]);

  const joinChallenge = async () => {
    try {
      const { data } = await API.post(`/challenges/${id}/join`, {}, authHeaders(token));
      setChallenge(data);
      toast.success("Challenge joined");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join challenge");
    }
  };

  const submitChallenge = async (event) => {
    event.preventDefault();
    if (!submission.title.trim()) {
      toast.error("Submission title is required");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await API.post(
        `/challenges/${id}/submissions`,
        {
          title: submission.title,
          description: submission.description,
          links: splitLinks(submission.links),
        },
        authHeaders(token)
      );
      setChallenge(data);
      setSubmission({ title: "", description: "", links: "" });
      setSubmissionOpen(false);
      toast.success("Submission saved");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit challenge");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="section"><div className="container"><div className="skeleton" style={{ height: 420 }} /></div></section>
    );
  }

  if (!challenge) return null;

  return (
    <section className="section">
      <div className="container">
        <div className="glass" style={styles.hero}>
          <div>
            <p style={styles.eyebrow}>{challenge.type}</p>
            <h1 style={styles.title}>{challenge.title}</h1>
            <p style={styles.copy}>{challenge.brief || challenge.description}</p>
          </div>
          <div style={styles.actions}>
            <span style={styles.timer}><Clock size={18} strokeWidth={2} /> {getCountdown(challenge.endsAt, now)}</span>
            {!joined ? (
              <button className="primary-btn" onClick={joinChallenge}><Trophy size={16} strokeWidth={2} /> Participate</button>
            ) : (
              <button className="primary-btn" onClick={() => setSubmissionOpen(true)}><Send size={16} strokeWidth={2} /> Submit work</button>
            )}
          </div>
        </div>

        <div style={styles.grid}>
          <main className="glass" style={styles.panel}>
            <h2 style={styles.panelTitle}>Challenge brief</h2>
            <p>{challenge.description || "Complete the challenge and submit your best work before the deadline."}</p>
            <div style={styles.stats}>
              <span><Users size={18} strokeWidth={2} /> {challenge.participants?.length || 0} participants</span>
              <span><Send size={18} strokeWidth={2} /> {challenge.submissions?.length || 0} submissions</span>
              <span><BadgeCheck size={18} strokeWidth={2} /> {challenge.rewards?.xp || 0} XP</span>
            </div>
            <h3 style={styles.subhead}>Rewards</h3>
            <div style={styles.pills}>
              <span style={styles.pill}>{challenge.rewards?.xp || 0} XP</span>
              {(challenge.rewards?.badges || []).map((badge) => <span key={badge} style={styles.pill}>{badge}</span>)}
            </div>
            <h3 style={styles.subhead}>Winner showcase</h3>
            <div style={styles.list}>
              {challenge.winnerShowcase?.length ? challenge.winnerShowcase.map((winner) => (
                <div key={`${winner.user?._id}-${winner.title}`} style={styles.row}>
                  <strong>{winner.title}</strong>
                  <span>{winner.user?.name || "Winner"} · {winner.score} pts</span>
                </div>
              )) : <p style={styles.muted}>Winners will appear after review.</p>}
            </div>
          </main>
          <aside className="glass" style={styles.panel}>
            <h2 style={styles.panelTitle}>Leaderboard</h2>
            <div style={styles.list}>
              {leaderboard.length ? leaderboard.map((entry, index) => (
                <div key={entry.user?._id || index} style={styles.memberRow}>
                  <span style={styles.rank}>{index + 1}</span>
                  <img src={entry.user?.avatar || "https://i.imgur.com/HeIi0wU.png"} alt={entry.user?.name || "User"} style={styles.avatar} />
                  <div>
                    <strong>{entry.user?.name || "Participant"}</strong>
                    <p style={styles.muted}>{entry.status}</p>
                  </div>
                  <span>{entry.score || 0}</span>
                </div>
              )) : <p style={styles.muted}>Join to appear on the leaderboard.</p>}
            </div>
          </aside>
        </div>

        {submissionOpen && (
          <div style={styles.backdrop}>
            <form className="glass anim-scale" style={styles.modal} onSubmit={submitChallenge}>
              <div style={styles.modalHeader}>
                <h3>Challenge submission</h3>
                <button type="button" style={styles.iconButton} onClick={() => setSubmissionOpen(false)}><X size={18} strokeWidth={2} /></button>
              </div>
              <label style={styles.field}>Title<input value={submission.title} onChange={(event) => setSubmission((current) => ({ ...current, title: event.target.value }))} /></label>
              <label style={styles.field}>Description<textarea rows={4} value={submission.description} onChange={(event) => setSubmission((current) => ({ ...current, description: event.target.value }))} /></label>
              <label style={styles.field}>Links<input value={submission.links} onChange={(event) => setSubmission((current) => ({ ...current, links: event.target.value }))} placeholder="Comma-separated links" /></label>
              <div style={styles.actions}>
                <button type="button" className="secondary-btn" onClick={() => setSubmissionOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

const styles = {
  hero: { padding: "1.5rem", display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" },
  eyebrow: { color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" },
  title: { fontSize: "clamp(2rem, 4vw, 3.2rem)" },
  copy: { maxWidth: 760 },
  actions: { display: "flex", gap: "0.65rem", alignItems: "center", flexWrap: "wrap" },
  timer: { display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--lime)", fontWeight: 800 },
  grid: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 360px)", gap: "1rem", alignItems: "start" },
  panel: { padding: "1.25rem" },
  panelTitle: { fontSize: "1.25rem", marginBottom: "0.9rem" },
  stats: { display: "flex", gap: "0.75rem", flexWrap: "wrap", margin: "1rem 0", color: "var(--off-white)" },
  subhead: { fontSize: "1rem", margin: "1.1rem 0 0.6rem" },
  pills: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
  pill: { border: "1px solid var(--border)", borderRadius: "var(--r-full)", padding: "0.28rem 0.65rem", background: "var(--surface-2)", color: "var(--off-white)" },
  list: { display: "grid", gap: "0.65rem" },
  row: { border: "1px solid var(--border)", borderRadius: "var(--r-md)", background: "var(--surface-2)", padding: "0.8rem", display: "flex", justifyContent: "space-between", gap: "1rem" },
  memberRow: { display: "grid", gridTemplateColumns: "auto auto 1fr auto", gap: "0.65rem", alignItems: "center", border: "1px solid var(--border)", borderRadius: "var(--r-md)", background: "var(--surface-2)", padding: "0.75rem" },
  rank: { color: "var(--lime)", fontFamily: "var(--font-mono)", fontWeight: 800 },
  avatar: { width: 34, height: 34, borderRadius: "50%", objectFit: "cover" },
  muted: { color: "var(--muted)", fontSize: "0.84rem" },
  backdrop: { position: "fixed", inset: 0, zIndex: 2300, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(0,0,0,0.72)", backdropFilter: "blur(12px)" },
  modal: { width: "min(620px, 100%)", padding: "1.25rem" },
  modalHeader: { display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" },
  iconButton: { width: 36, height: 36, borderRadius: "var(--r-sm)", background: "var(--surface-2)", color: "var(--off-white)", border: "1px solid var(--border)" },
  field: { display: "grid", gap: "0.35rem", color: "var(--muted)", fontSize: "0.78rem", fontWeight: 800, marginBottom: "0.75rem" },
};

export default ChallengeDetail;
