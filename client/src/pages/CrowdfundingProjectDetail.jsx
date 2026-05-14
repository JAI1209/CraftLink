import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Bookmark, Check, CircleDollarSign, Clock, Link as LinkIcon, Send, Share2, Users, X } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const authHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const emptyApplication = {
  fullName: "",
  username: "",
  skills: "",
  experienceLevel: "Intermediate",
  portfolioUrl: "",
  previousWork: "",
  availability: "",
  contribution: "",
  motivation: "",
  socialLinks: "",
  role: "Contributor",
};

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const splitList = (value) => value.split(",").map((item) => item.trim()).filter(Boolean);

const CrowdfundingProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [application, setApplication] = useState(emptyApplication);
  const [submitting, setSubmitting] = useState(false);

  const isCreator = project?.creator?._id === user?._id;
  const fundingPercent = project?.fundingGoal
    ? Math.min(Math.round(((project.fundingRaised || 0) / project.fundingGoal) * 100), 100)
    : 0;
  const approvedCount = useMemo(
    () => project?.contributors?.filter((item) => ["approved", "active"].includes(item.status)).length || 0,
    [project]
  );
  const pendingApplications = project?.contributors?.filter((item) => item.status === "requested") || [];
  const myApplication = project?.contributors?.find((item) => item.user?._id === user?._id);

  const loadProject = async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/crowdfunding/${id}`, authHeaders(token));
      setProject(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load project");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id, token]);

  const copyLink = async () => {
    await navigator.clipboard?.writeText(window.location.href);
    toast.success("Project link copied");
  };

  const submitApplication = async (event) => {
    event.preventDefault();
    if (!application.fullName.trim() || !application.skills.trim() || !application.contribution.trim() || !application.motivation.trim()) {
      toast.error("Name, skills, contribution, and motivation are required");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await API.post(
        `/crowdfunding/${id}/participation`,
        {
          ...application,
          skills: splitList(application.skills),
          socialLinks: splitList(application.socialLinks),
          experience: application.previousWork,
        },
        authHeaders(token)
      );
      setProject(data);
      setApplication(emptyApplication);
      setApplicationOpen(false);
      toast.success("Application submitted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const decideApplication = async (contributorId, action) => {
    try {
      const { data } = await API.put(
        `/crowdfunding/${id}/contributors/${contributorId}/${action}`,
        {},
        authHeaders(token)
      );
      setProject(data);
      toast.success(action === "approve" ? "Applicant approved" : "Applicant rejected");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update application");
    }
  };

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="skeleton" style={{ height: 420 }} />
        </div>
      </section>
    );
  }

  if (!project) return null;

  return (
    <section className="section">
      <div className="container">
        <div className="glass" style={styles.hero}>
          {project.bannerImage && <img src={project.bannerImage} alt={project.title} style={styles.banner} />}
          <div style={styles.heroContent}>
            <div>
              <p style={styles.eyebrow}>{project.category} · {project.difficulty}</p>
              <h1 style={styles.title}>{project.title}</h1>
              <p style={styles.tagline}>{project.tagline || project.summary}</p>
            </div>
            <div style={styles.actions}>
              <button className="secondary-btn" onClick={copyLink}><Share2 size={16} strokeWidth={2} /> Share</button>
              {!isCreator && !myApplication && (
                <button className="primary-btn" onClick={() => setApplicationOpen(true)}><Send size={16} strokeWidth={2} /> Apply</button>
              )}
              {!isCreator && myApplication && (
                <button className="secondary-btn" disabled><Clock size={16} strokeWidth={2} /> {myApplication.status}</button>
              )}
            </div>
          </div>
        </div>

        <div style={styles.grid}>
          <main className="glass" style={styles.panel}>
            <h2 style={styles.panelTitle}>Project details</h2>
            <p>{project.description || project.summary}</p>

            <div style={styles.progressBlock}>
              <div style={styles.progressTop}>
                <span><CircleDollarSign size={18} strokeWidth={2} /> {formatCurrency(project.fundingRaised)} raised</span>
                <strong>{fundingPercent}%</strong>
              </div>
              <div style={styles.progressTrack}><div style={{ ...styles.progressFill, width: `${fundingPercent}%` }} /></div>
              <p style={styles.muted}>Goal: {formatCurrency(project.fundingGoal)}</p>
            </div>

            <div style={styles.infoGrid}>
              <div style={styles.infoCard}><Users size={18} strokeWidth={2} /><strong>{approvedCount}/{project.requiredCollaborators}</strong><span>collaborator slots</span></div>
              <div style={styles.infoCard}><Clock size={18} strokeWidth={2} /><strong>{project.deadline ? new Date(project.deadline).toLocaleDateString("en-IN") : "Flexible"}</strong><span>timeline</span></div>
              <div style={styles.infoCard}><Bookmark size={18} strokeWidth={2} /><strong>{project.status}</strong><span>stage</span></div>
            </div>

            <h3 style={styles.subhead}>Required skills</h3>
            <div style={styles.pills}>{project.requiredSkills?.map((skill) => <span key={skill} style={styles.pill}>{skill}</span>)}</div>

            <h3 style={styles.subhead}>Collaboration roles</h3>
            <div style={styles.pills}>{project.collaborationRoles?.length ? project.collaborationRoles.map((role) => <span key={role} style={styles.pill}>{role}</span>) : <span style={styles.muted}>Open contributor roles</span>}</div>

            <h3 style={styles.subhead}>Roadmap</h3>
            <div style={styles.roadmap}>
              {project.roadmap?.length ? project.roadmap.map((item) => (
                <div key={item.title} style={styles.roadmapItem}>
                  <span className="badge badge-lime">{item.status}</span>
                  <strong>{item.title}</strong>
                </div>
              )) : <p style={styles.muted}>Roadmap will be published soon.</p>}
            </div>

            {project.projectLinks?.length > 0 && (
              <>
                <h3 style={styles.subhead}>Links</h3>
                <div style={styles.roadmap}>
                  {project.projectLinks.map((link) => (
                    <a key={link} href={link} target="_blank" rel="noreferrer" style={styles.linkRow}>
                      <LinkIcon size={16} strokeWidth={2} /> {link}
                    </a>
                  ))}
                </div>
              </>
            )}
          </main>

          <aside className="glass" style={styles.panel}>
            <h2 style={styles.panelTitle}>Creator</h2>
            <div style={styles.creator}>
              <img src={project.creator?.avatar || "https://i.imgur.com/HeIi0wU.png"} alt={project.creator?.name || "Creator"} style={styles.avatar} />
              <div>
                <strong>{project.creator?.name || "CraftLink member"}</strong>
                <p style={styles.muted}>{project.creator?.headline || "Project creator"}</p>
              </div>
            </div>

            {isCreator && (
              <>
                <h3 style={styles.subhead}>Applications</h3>
                <div style={styles.roadmap}>
                  {pendingApplications.length === 0 ? (
                    <p style={styles.muted}>No pending applications.</p>
                  ) : pendingApplications.map((applicant) => (
                    <div key={applicant._id} style={styles.applicationCard}>
                      <strong>{applicant.fullName || applicant.user?.name}</strong>
                      <p style={styles.muted}>{applicant.contribution}</p>
                      <p style={styles.muted}>{applicant.portfolioUrl}</p>
                      <div style={styles.actions}>
                        <button className="secondary-btn" onClick={() => decideApplication(applicant._id, "approve")}><Check size={16} strokeWidth={2} /> Accept</button>
                        <button className="secondary-btn" onClick={() => decideApplication(applicant._id, "reject")}><X size={16} strokeWidth={2} /> Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </aside>
        </div>

        {applicationOpen && (
          <div style={styles.backdrop}>
            <form className="glass anim-scale" style={styles.modal} onSubmit={submitApplication}>
              <div style={styles.modalHeader}>
                <h3>Participation application</h3>
                <button type="button" style={styles.iconButton} onClick={() => setApplicationOpen(false)}><X size={18} strokeWidth={2} /></button>
              </div>
              <div style={styles.formGrid}>
                {[
                  ["fullName", "Full name"],
                  ["username", "Username"],
                  ["skills", "Skills"],
                  ["portfolioUrl", "Portfolio links"],
                  ["previousWork", "Previous projects/work"],
                  ["availability", "Availability"],
                  ["contribution", "Contribution you can provide"],
                  ["motivation", "Why you want to join"],
                  ["socialLinks", "Social/profile links"],
                  ["role", "Preferred role"],
                ].map(([field, label]) => (
                  <label key={field} style={styles.field}>{label}
                    <textarea
                      rows={["previousWork", "contribution", "motivation"].includes(field) ? 3 : 1}
                      value={application[field]}
                      onChange={(event) => setApplication((current) => ({ ...current, [field]: event.target.value }))}
                    />
                  </label>
                ))}
                <label style={styles.field}>Experience level
                  <select value={application.experienceLevel} onChange={(event) => setApplication((current) => ({ ...current, experienceLevel: event.target.value }))}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Expert</option>
                  </select>
                </label>
              </div>
              <div style={styles.actions}>
                <button type="button" className="secondary-btn" onClick={() => setApplicationOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={submitting}>{submitting ? "Submitting..." : "Submit application"}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

const styles = {
  hero: { overflow: "hidden", marginBottom: "1rem" },
  banner: { width: "100%", height: 220, objectFit: "cover" },
  heroContent: { padding: "1.5rem", display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" },
  eyebrow: { color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" },
  title: { fontSize: "clamp(2rem, 4vw, 3.2rem)" },
  tagline: { maxWidth: 720 },
  actions: { display: "flex", gap: "0.65rem", flexWrap: "wrap", alignItems: "center" },
  grid: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 360px)", gap: "1rem", alignItems: "start" },
  panel: { padding: "1.25rem" },
  panelTitle: { fontSize: "1.3rem", marginBottom: "1rem" },
  progressBlock: { margin: "1.2rem 0" },
  progressTop: { display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "0.55rem", color: "var(--off-white)" },
  progressTrack: { height: 9, borderRadius: "var(--r-full)", background: "var(--surface-3)", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: "inherit", background: "var(--lime)" },
  muted: { color: "var(--muted)", fontSize: "0.84rem" },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", margin: "1rem 0" },
  infoCard: { border: "1px solid var(--border)", background: "var(--surface-2)", borderRadius: "var(--r-md)", padding: "0.9rem", display: "grid", gap: "0.35rem" },
  subhead: { fontSize: "1rem", margin: "1.2rem 0 0.65rem" },
  pills: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  pill: { border: "1px solid var(--border)", borderRadius: "var(--r-full)", padding: "0.28rem 0.65rem", color: "var(--off-white)", background: "var(--surface-2)", fontSize: "0.78rem" },
  roadmap: { display: "grid", gap: "0.65rem" },
  roadmapItem: { border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "0.75rem", background: "var(--surface-2)", display: "flex", justifyContent: "space-between", gap: "1rem" },
  linkRow: { display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--lime)", fontSize: "0.85rem" },
  creator: { display: "flex", alignItems: "center", gap: "0.75rem" },
  avatar: { width: 46, height: 46, borderRadius: "50%", objectFit: "cover" },
  applicationCard: { border: "1px solid var(--border)", borderRadius: "var(--r-md)", background: "var(--surface-2)", padding: "0.85rem" },
  backdrop: { position: "fixed", inset: 0, zIndex: 2300, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(0,0,0,0.72)", backdropFilter: "blur(12px)" },
  modal: { width: "min(860px, 100%)", maxHeight: "calc(100vh - 2rem)", overflowY: "auto", padding: "1.25rem" },
  modalHeader: { display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" },
  iconButton: { width: 36, height: 36, borderRadius: "var(--r-sm)", background: "var(--surface-2)", color: "var(--off-white)", border: "1px solid var(--border)" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.8rem" },
  field: { display: "grid", gap: "0.35rem", color: "var(--muted)", fontSize: "0.78rem", fontWeight: 800 },
};

export default CrowdfundingProjectDetail;
