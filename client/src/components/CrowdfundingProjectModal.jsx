import { useState } from "react";
import toast from "react-hot-toast";
import { Rocket, X } from "lucide-react";
import API from "../services/api";

const initialForm = {
  title: "",
  tagline: "",
  summary: "",
  description: "",
  category: "community",
  fundingGoal: "",
  fundingRaised: "0",
  requiredCollaborators: "1",
  requiredSkills: "",
  roadmap: "",
  difficulty: "Intermediate",
  status: "active",
  deadline: "",
  bannerImage: "",
  projectLinks: "",
  visibility: "public",
  collaborationRoles: "",
};

const authHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const splitList = (value) =>
  value.split(",").map((item) => item.trim()).filter(Boolean);

const CrowdfundingProjectModal = ({ open, token, onClose, onCreated }) => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.summary.trim() || Number(form.fundingGoal) <= 0) {
      toast.error("Title, summary, and funding goal are required");
      return;
    }

    setSubmitting(true);
    try {
      const roadmap = form.roadmap
        .split("\n")
        .map((title) => title.trim())
        .filter(Boolean)
        .map((title) => ({ title, status: "planned" }));

      const { data } = await API.post(
        "/crowdfunding",
        {
          title: form.title,
          tagline: form.tagline,
          summary: form.summary,
          description: form.description,
          category: form.category,
          fundingGoal: Number(form.fundingGoal),
          fundingRaised: Number(form.fundingRaised) || 0,
          requiredCollaborators: Number(form.requiredCollaborators) || 1,
          requiredSkills: splitList(form.requiredSkills),
          roadmap,
          difficulty: form.difficulty,
          status: form.status,
          deadline: form.deadline || null,
          bannerImage: form.bannerImage,
          projectLinks: splitList(form.projectLinks),
          visibility: form.visibility,
          collaborationRoles: splitList(form.collaborationRoles),
        },
        authHeaders(token)
      );

      toast.success("Project created");
      setForm(initialForm);
      onCreated?.(data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.backdrop} role="dialog" aria-modal="true">
      <form className="glass anim-scale" style={styles.modal} onSubmit={submit}>
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Crowdfunding</p>
            <h3 style={styles.title}><Rocket size={22} strokeWidth={2} /> Create project</h3>
          </div>
          <button type="button" style={styles.close} onClick={onClose} aria-label="Close project form">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div style={styles.grid}>
          <label style={styles.field}>Project title<input value={form.title} onChange={(e) => update("title", e.target.value)} required /></label>
          <label style={styles.field}>Short tagline<input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} /></label>
          <label style={styles.field}>Category<input value={form.category} onChange={(e) => update("category", e.target.value)} /></label>
          <label style={styles.field}>Funding goal<input type="number" min="1" value={form.fundingGoal} onChange={(e) => update("fundingGoal", e.target.value)} required /></label>
          <label style={styles.field}>Current funding<input type="number" min="0" value={form.fundingRaised} onChange={(e) => update("fundingRaised", e.target.value)} /></label>
          <label style={styles.field}>Required collaborators<input type="number" min="1" value={form.requiredCollaborators} onChange={(e) => update("requiredCollaborators", e.target.value)} /></label>
          <label style={styles.field}>Difficulty<select value={form.difficulty} onChange={(e) => update("difficulty", e.target.value)}><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option></select></label>
          <label style={styles.field}>Stage/status<select value={form.status} onChange={(e) => update("status", e.target.value)}><option value="active">Active</option><option value="draft">Draft</option><option value="paused">Paused</option></select></label>
          <label style={styles.field}>Deadline<input type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} /></label>
          <label style={styles.field}>Visibility<select value={form.visibility} onChange={(e) => update("visibility", e.target.value)}><option value="public">Public</option><option value="private">Private</option></select></label>
          <label style={styles.fieldWide}>Short summary<textarea rows={3} value={form.summary} onChange={(e) => update("summary", e.target.value)} required /></label>
          <label style={styles.fieldWide}>Detailed description<textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} /></label>
          <label style={styles.fieldWide}>Required skills<input value={form.requiredSkills} onChange={(e) => update("requiredSkills", e.target.value)} placeholder="frontend, node, research" /></label>
          <label style={styles.fieldWide}>Collaboration roles needed<input value={form.collaborationRoles} onChange={(e) => update("collaborationRoles", e.target.value)} placeholder="Frontend lead, API engineer" /></label>
          <label style={styles.fieldWide}>Project roadmap<textarea rows={3} value={form.roadmap} onChange={(e) => update("roadmap", e.target.value)} placeholder="One milestone per line" /></label>
          <label style={styles.fieldWide}>Banner image URL<input value={form.bannerImage} onChange={(e) => update("bannerImage", e.target.value)} /></label>
          <label style={styles.fieldWide}>Project links<input value={form.projectLinks} onChange={(e) => update("projectLinks", e.target.value)} placeholder="Comma-separated URLs" /></label>
        </div>

        <div style={styles.actions}>
          <button type="button" className="secondary-btn" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="primary-btn" disabled={submitting}>{submitting ? "Creating..." : "Create project"}</button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 2200,
    background: "rgba(0,0,0,0.72)",
    backdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  },
  modal: {
    width: "min(920px, 100%)",
    maxHeight: "calc(100vh - 2rem)",
    overflowY: "auto",
    padding: "1.25rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    marginBottom: "1rem",
  },
  eyebrow: {
    color: "var(--muted)",
    fontFamily: "var(--font-mono)",
    fontSize: "0.72rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: "0.35rem",
  },
  title: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: "var(--r-sm)",
    background: "var(--surface-2)",
    color: "var(--off-white)",
    border: "1px solid var(--border)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "0.85rem",
  },
  field: {
    display: "grid",
    gap: "0.35rem",
    color: "var(--muted)",
    fontSize: "0.78rem",
    fontWeight: 800,
  },
  fieldWide: {
    display: "grid",
    gap: "0.35rem",
    color: "var(--muted)",
    fontSize: "0.78rem",
    fontWeight: 800,
    gridColumn: "1 / -1",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    marginTop: "1rem",
    flexWrap: "wrap",
  },
};

export default CrowdfundingProjectModal;
