import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Pencil, Plus, Trash2 } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";
import CrowdfundingProjectModal from "../components/CrowdfundingProjectModal";

const authHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const fundingPercent = (project) => {
  if (!project?.fundingGoal) return 0;
  return Math.min(Math.round(((project.fundingRaised || 0) / project.fundingGoal) * 100), 100);
};

const isObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || ""));

const normalizeProjectCard = (project) => ({
  ...project,
  contributorsCount: project.contributorsCount ?? (
    project.contributors?.filter((item) => ["approved", "active"].includes(item.status)).length || 0
  ),
});

const MiniProgress = ({ value, accent = "var(--lime)" }) => (
  <div style={styles.progressTrack}>
    <div style={{ ...styles.progressFill, width: `${Math.max(0, Math.min(value, 100))}%`, background: accent }} />
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [pending, setPending] = useState(0);
  const [hub, setHub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    const h = authHeaders(token);
    Promise.all([
      API.get("/auth/me", h),
      API.get("/skills/my-skills", h),
      API.get("/requests/received", h).catch(() => ({ data: [] })),
      API.get("/dashboard/hub", h).catch(() => ({ data: null })),
    ])
      .then(([u, s, r, d]) => {
        setUser(u.data);
        setSkills(s.data);
        setPending(r.data.filter((x) => x.status === "pending").length);
        setHub(d.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const handleCrowdfundingUpdate = ({ project }) => {
      if (!project?._id) return;
      const nextProject = normalizeProjectCard(project);
      setHub((current) => {
        if (!current?.crowdfunding?.projects) return current;
        const projects = current.crowdfunding.projects.some((item) => item._id === nextProject._id)
          ? current.crowdfunding.projects.map((item) => (item._id === nextProject._id ? nextProject : item))
          : [nextProject, ...current.crowdfunding.projects].slice(0, 4);

        return {
          ...current,
          crowdfunding: {
            ...current.crowdfunding,
            projects,
            featured: projects.find((item) => item.status === "featured") || projects[0] || null,
          },
        };
      });
    };

    socket.on("dashboard:crowdfunding", handleCrowdfundingUpdate);
    return () => socket.off("dashboard:crowdfunding", handleCrowdfundingUpdate);
  }, [token]);

  const stats = useMemo(() => [
    { val: skills.length, label: "Listings", accent: "var(--lime)" },
    { val: pending, label: "Pending", accent: "#fbbf24" },
    { val: user?.rating > 0 ? user.rating : "-", label: "Rating", accent: "#a5b4fc" },
    { val: user?.totalReviews || 0, label: "Reviews", accent: "var(--coral)" },
  ], [pending, skills.length, user]);

  const del = async (id) => {
    if (!confirm("Delete this skill?")) return;
    try {
      await API.delete(`/skills/${id}`, authHeaders(token));
      setSkills(skills.filter((skill) => skill._id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed");
    }
  };

  const refreshHub = async () => {
    try {
      const { data } = await API.get("/dashboard/hub", authHeaders(token));
      setHub(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to refresh dashboard");
    }
  };

  if (loading) return (
    <section className="section"><div className="container">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
        {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: "var(--r-lg)" }} />)}
      </div>
    </div></section>
  );

  const activeChallenges = hub?.challenges?.active || [];
  const upcomingChallenges = hub?.challenges?.upcoming || [];
  const projects = hub?.crowdfunding?.projects || [];
  const badges = hub?.xp?.badges || [];
  const topContributors = hub?.community?.topContributors || [];
  const trendingDiscussions = hub?.community?.trendingDiscussions || [];

  return (
    <section className="section">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <p style={styles.eyebrow}>Dashboard</p>
            <h1 style={{ marginBottom: "0.4rem" }}>Hey, {user?.name?.split(" ")[0]}</h1>
            <p style={{ fontSize: "0.88rem" }}>{user?.email}</p>
          </div>
          <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
            <button className="primary-btn" onClick={() => navigate("/add-skill")} style={styles.inlineButton}>
              <Plus size={16} strokeWidth={2} /> New skill
            </button>
            <button className="secondary-btn" onClick={() => setProjectModalOpen(true)} style={styles.inlineButton}>
              <Plus size={16} strokeWidth={2} /> New project
            </button>
            <button className="secondary-btn" onClick={() => navigate("/profile")}>Edit profile</button>
          </div>
        </motion.div>

        <div style={styles.statsGrid} className="stagger">
          {stats.map((stat, index) => (
            <motion.div key={stat.label} className="glass anim-up" whileHover={{ y: -4 }} style={{ padding: "1.8rem" }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", fontWeight: 800, color: stat.accent, marginBottom: "0.4rem", lineHeight: 1 }}>{stat.val}</p>
              <p style={styles.metricLabel}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div style={styles.quickActions}>
          {[
            ["Explore Skills", "/skills"],
            ["My Requests", "/requests"],
            ["Messages", "/messages"],
            ["Shared Notes", "/notes"],
            ["Saved Skills", "/saved-skills"],
          ].map(([label, path]) => (
            <button key={label} className="secondary-btn" onClick={() => navigate(path)} style={{ fontSize: "0.82rem", padding: "0.65rem" }}>{label}</button>
          ))}
        </div>

        <div style={styles.hubGrid}>
          <div className="glass" style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <p style={styles.eyebrow}>XP and reputation</p>
                <h2 style={styles.panelTitle}>Level {hub?.xp?.level || 1}</h2>
              </div>
              <strong style={styles.xpValue}>{hub?.xp?.total || 0} XP</strong>
            </div>
            <MiniProgress value={hub?.xp?.progress || 0} />
            <div style={styles.compactStats}>
              <span>{hub?.xp?.nextLevelXp || 1000} XP to next level</span>
              <span>{hub?.xp?.streak || 0} day streak</span>
              <span>{hub?.xp?.contributionStats?.activityLevel || "Emerging"}</span>
            </div>
            <div style={styles.badgeRow}>
              {(badges.length ? badges : [
                { label: "Community Helper" },
                { label: "Top Collaborator" },
                { label: "Research Specialist" },
              ]).slice(0, 5).map((badge) => (
                <span key={badge.key || badge.label} style={styles.skillPill}>{badge.label}</span>
              ))}
            </div>
          </div>

          <div className="glass" style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <p style={styles.eyebrow}>Community games</p>
                <h2 style={styles.panelTitle}>Challenges</h2>
              </div>
              <span style={styles.metricLabel}>{hub?.challenges?.participationStats?.totalParticipants || 0} participants</span>
            </div>
            <div style={styles.listStack}>
              {[...activeChallenges, ...upcomingChallenges].slice(0, 4).map((challenge) => (
                <button
                  key={challenge._id}
                  type="button"
                  onClick={() => isObjectId(challenge._id) && navigate(`/challenges/${challenge._id}`)}
                  style={styles.rowCard}
                >
                  <div>
                    <strong>{challenge.title}</strong>
                    <p>{challenge.type}</p>
                  </div>
                  <div style={styles.rightMeta}>
                    <span className="badge badge-lime">{challenge.status}</span>
                    <small>{challenge.rewards?.xp || 0} XP</small>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.hubGrid}>
          <div className="glass" style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <p style={styles.eyebrow}>Crowdfunding</p>
                <h2 style={styles.panelTitle}>Project Launchpad</h2>
              </div>
              <button className="secondary-btn" onClick={() => setProjectModalOpen(true)} style={styles.smallAction}>Create</button>
            </div>
            <div style={styles.listStack}>
              {projects.slice(0, 3).map((project) => (
                <button
                  key={project._id}
                  type="button"
                  onClick={() => isObjectId(project._id) && navigate(`/crowdfunding/${project._id}`)}
                  style={styles.projectCard}
                >
                  <div style={styles.panelHeader}>
                    <div>
                      <strong>{project.title}</strong>
                      <p style={styles.mutedText}>{project.summary}</p>
                    </div>
                    <span className="badge badge-lime">{project.status}</span>
                  </div>
                  <MiniProgress value={fundingPercent(project)} accent="#a5b4fc" />
                  <div style={styles.compactStats}>
                    <span>{formatCurrency(project.fundingRaised)} raised</span>
                    <span>{fundingPercent(project)}%</span>
                    <span>{project.contributorsCount}/{project.requiredCollaborators} collaborators</span>
                  </div>
                  <div style={styles.badgeRow}>
                    {(project.requiredSkills || []).slice(0, 4).map((skill) => (
                      <span key={skill} style={styles.skillPill}>{skill}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass" style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <p style={styles.eyebrow}>Community activity</p>
                <h2 style={styles.panelTitle}>Reputation pulse</h2>
              </div>
              <strong style={styles.xpValue}>{hub?.community?.metrics?.reputationScore || 0}</strong>
            </div>
            <div style={styles.listStack}>
              {topContributors.slice(0, 4).map((member, index) => (
                <div key={member._id} style={styles.memberRow}>
                  <span style={styles.rank}>{index + 1}</span>
                  <img src={member.avatar || "https://i.imgur.com/HeIi0wU.png"} alt={member.name} style={styles.avatar} />
                  <div>
                    <strong>{member.name}</strong>
                    <p>{member.headline || member.activityLevel || "Active collaborator"}</p>
                  </div>
                  <span style={styles.metricLabel}>{member.reputationScore || 0}</span>
                </div>
              ))}
              {trendingDiscussions.slice(0, 2).map((note) => (
                <button key={note._id} type="button" onClick={() => navigate(`/notes?note=${note._id}`)} style={styles.discussionButton}>
                  <strong>{note.title}</strong>
                  <span>{note.category} - {note.likesCount || 0} likes - {note.commentsCount || 0} comments</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="glass" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.8rem" }}>
            <h2 style={{ fontSize: "1.4rem" }}>My listings</h2>
            <button className="primary-btn" onClick={() => navigate("/add-skill")} style={{ padding: "0.6rem 1.1rem", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Plus size={16} strokeWidth={2} /> Add
            </button>
          </div>

          {skills.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
              <p style={{ marginBottom: "1.2rem" }}>No listings yet. Share your first skill.</p>
              <button className="primary-btn" onClick={() => navigate("/add-skill")}>Get started</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1rem" }}>
              {skills.map((skill, index) => (
                <motion.div key={skill._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  style={{ padding: "1.4rem", borderRadius: "var(--r-md)", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
                    <span className="badge badge-lime">{skill.category}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: skill.status === "active" ? "#4ade80" : "var(--muted)" }}>
                      {skill.status}
                    </span>
                  </div>
                  <h4 style={{ marginBottom: "0.4rem", fontSize: "0.95rem" }}>{skill.title}</h4>
                  <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: "0.8rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {skill.description}
                  </p>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.3rem", color: "var(--white)", marginBottom: "1rem" }}>{formatCurrency(skill.price)}</p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => navigate(`/edit-skill/${skill._id}`)} style={styles.listingButton}>
                      <Pencil size={16} strokeWidth={2} /> Edit
                    </button>
                    <button onClick={() => del(skill._id)} style={{ ...styles.listingButton, background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                      <Trash2 size={16} strokeWidth={2} /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <CrowdfundingProjectModal
          open={projectModalOpen}
          token={token}
          onClose={() => setProjectModalOpen(false)}
          onCreated={refreshHub}
        />
      </div>
    </section>
  );
};

const styles = {
  eyebrow: {
    fontFamily: "var(--font-mono)",
    fontSize: "0.75rem",
    color: "var(--muted)",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "0.5rem",
  },
  inlineButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: "1rem",
    marginBottom: "2.5rem",
  },
  metricLabel: {
    fontSize: "0.8rem",
    color: "var(--muted)",
    fontFamily: "var(--font-mono)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  quickActions: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))",
    gap: "0.7rem",
    marginBottom: "2.5rem",
  },
  hubGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    gap: "1rem",
    marginBottom: "1rem",
  },
  panel: {
    padding: "1.4rem",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1rem",
  },
  panelTitle: {
    fontSize: "1.25rem",
    margin: 0,
  },
  xpValue: {
    color: "var(--lime)",
    fontFamily: "var(--font-display)",
    fontSize: "1.35rem",
  },
  progressTrack: {
    height: 8,
    borderRadius: "var(--r-full)",
    background: "var(--surface-3)",
    border: "1px solid var(--border)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "inherit",
  },
  compactStats: {
    display: "flex",
    gap: "0.7rem",
    flexWrap: "wrap",
    color: "var(--muted)",
    fontSize: "0.78rem",
    marginTop: "0.75rem",
  },
  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginTop: "0.9rem",
  },
  skillPill: {
    border: "1px solid var(--border)",
    borderRadius: "var(--r-full)",
    padding: "0.28rem 0.62rem",
    color: "var(--off-white)",
    background: "var(--surface-2)",
    fontSize: "0.74rem",
  },
  listStack: {
    display: "grid",
    gap: "0.75rem",
  },
  rowCard: {
    width: "100%",
    textAlign: "left",
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    padding: "0.9rem",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border)",
    background: "var(--surface-2)",
    color: "inherit",
  },
  rightMeta: {
    display: "grid",
    justifyItems: "end",
    gap: "0.35rem",
    color: "var(--muted)",
  },
  smallAction: {
    padding: "0.48rem 0.8rem",
    fontSize: "0.78rem",
  },
  projectCard: {
    width: "100%",
    textAlign: "left",
    padding: "1rem",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border)",
    background: "var(--surface-2)",
    color: "inherit",
  },
  mutedText: {
    color: "var(--muted)",
    fontSize: "0.82rem",
    marginTop: "0.35rem",
  },
  memberRow: {
    display: "grid",
    gridTemplateColumns: "auto auto 1fr auto",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.85rem",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border)",
    background: "var(--surface-2)",
  },
  rank: {
    color: "var(--lime)",
    fontFamily: "var(--font-mono)",
    fontWeight: 800,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    objectFit: "cover",
  },
  discussionButton: {
    textAlign: "left",
    padding: "0.85rem",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--off-white)",
  },
  listingButton: {
    flex: 1,
    padding: "0.55rem",
    borderRadius: "var(--r-sm)",
    background: "var(--surface-3)",
    border: "1px solid var(--border)",
    color: "var(--off-white)",
    cursor: "pointer",
    fontSize: "0.8rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.35rem",
    fontFamily: "var(--font-body)",
  },
};

export default Dashboard;
