import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Expert"];

// Convert any URL or file to a usable image src
const getAvatarSrc = (url) => {
  if (!url) return null;
  if (url.startsWith("data:")) return url; // base64
  if (/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url)) return url; // direct image
  // Proxy for arbitrary URLs (Pinterest, etc.)
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=300&h=300&fit=cover&output=jpg`;
};

const Profile = () => {
  const { user: authUser, login, token } = useAuth();
  const navigate  = useNavigate();
  const fileRef   = useRef(null);

  const [profile,     setProfile]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [skillInput,  setSkillInput]  = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [form, setForm] = useState({
    name: "", bio: "", headline: "", location: "",
    skills: [], github: "", linkedin: "", portfolio: "",
    experienceLevel: "Beginner", openToWork: true, avatar: "",
  });

  // ── FETCH PROFILE ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(data);
        const f = {
          name:            data.name            || "",
          bio:             data.bio             || "",
          headline:        data.headline        || "",
          location:        data.location        || "",
          skills:          data.skills          || [],
          github:          data.github          || "",
          linkedin:        data.linkedin        || "",
          portfolio:       data.portfolio       || "",
          experienceLevel: data.experienceLevel || "Beginner",
          openToWork:      data.openToWork      ?? true,
          avatar:          data.avatar          || "",
        };
        setForm(f);
        setAvatarPreview(getAvatarSrc(f.avatar));
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  // ── HANDLE INPUT ───────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
    if (name === "avatar") setAvatarPreview(getAvatarSrc(value));
  };

  // ── FILE UPLOAD → BASE64 ───────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setForm((prev) => ({ ...prev, avatar: base64 }));
      setAvatarPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  // ── SKILLS ─────────────────────────────────────────────────────────────────
  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || form.skills.includes(s)) return;
    setForm((prev) => ({ ...prev, skills: [...prev.skills, s] }));
    setSkillInput("");
  };

  const removeSkill = (skill) =>
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));

  // ── SAVE ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await API.put("/users/profile", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      login(token, { ...authUser, ...data });
      toast.success("Profile updated! ✅");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (loading) return (
    <section className="section">
      <div className="container">
        <div className="glass" style={{ padding: "3rem", textAlign: "center" }}>
          <h2>Loading...</h2>
        </div>
      </div>
    </section>
  );

  const displayAvatar = avatarPreview || "https://i.imgur.com/HeIi0wU.png";

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 1100 }}>

        {/* ── PROFILE HEADER CARD ── */}
        <div className="glass" style={{
          padding: "2.5rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          flexWrap: "wrap",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Avatar + upload */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img
              src={displayAvatar}
              alt="avatar"
              onError={(e) => { e.target.src = "https://i.imgur.com/HeIi0wU.png"; }}
              style={{
                width: 110, height: 110,
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid var(--accent-primary)",
                display: "block",
              }}
            />
            {/* Upload overlay */}
            <button
              onClick={() => fileRef.current?.click()}
              title="Upload photo"
              style={{
                position: "absolute", bottom: 0, right: 0,
                width: 32, height: 32,
                borderRadius: "50%",
                background: "var(--accent-primary)",
                border: "2px solid var(--bg-primary, #0d0d0d)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem", color: "#fff",
              }}
            >📷</button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>

          {/* Name / headline / location */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ marginBottom: "0.25rem", fontSize: "1.8rem" }}>
              {form.name || "Your Name"}
            </h1>
            <p style={{ color: "var(--accent-secondary)", fontWeight: 500 }}>
              {form.headline || "Add a headline"}
            </p>
            <p style={{ marginTop: "0.4rem", fontSize: "0.88rem", opacity: 0.7 }}>
              📍 {form.location || "Add location"}
            </p>
            <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{
                fontSize: "0.8rem", padding: "0.25rem 0.75rem",
                borderRadius: 999,
                background: "rgba(200,116,42,0.15)",
                color: "var(--accent-secondary)",
                border: "1px solid rgba(200,116,42,0.3)",
              }}>
                {form.experienceLevel}
              </span>
              {form.openToWork && (
                <span style={{
                  fontSize: "0.8rem", padding: "0.25rem 0.75rem",
                  borderRadius: 999,
                  background: "rgba(74,222,128,0.12)",
                  color: "#4ade80",
                  border: "1px solid rgba(74,222,128,0.3)",
                }}>
                  ✅ Open to Work
                </span>
              )}
            </div>
          </div>

          {/* Open to work toggle */}
          <div style={{ marginLeft: "auto" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                name="openToWork"
                checked={form.openToWork}
                onChange={handleChange}
                style={{ width: 18, height: 18, accentColor: "#4ade80" }}
              />
              <span style={{ color: "#4ade80", fontWeight: 600, fontSize: "0.95rem" }}>Open to Work</span>
            </label>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Basic Info */}
            <div className="glass" style={{ padding: "2rem" }}>
              <h2 style={{ marginBottom: "1.5rem", fontSize: "1.2rem" }}>Basic Info</h2>

              {[
                { label: "Name",     name: "name",     placeholder: "Full name" },
                { label: "Headline", name: "headline", placeholder: "e.g. Full Stack Developer" },
                { label: "Location", name: "location", placeholder: "City, Country" },
              ].map(({ label, name, placeholder }) => (
                <div key={name} style={{ marginBottom: "1rem" }}>
                  <label style={{ fontSize: "0.85rem", display: "block", marginBottom: "0.3rem", opacity: 0.75 }}>
                    {label}
                  </label>
                  <input
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    style={{ width: "100%" }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.85rem", display: "block", marginBottom: "0.3rem", opacity: 0.75 }}>
                  Experience Level
                </label>
                <select
                  name="experienceLevel"
                  value={form.experienceLevel}
                  onChange={handleChange}
                  style={{ width: "100%" }}
                >
                  {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {/* Avatar section */}
              <div style={{ marginBottom: "0.5rem" }}>
                <label style={{ fontSize: "0.85rem", display: "block", marginBottom: "0.5rem", opacity: 0.75 }}>
                  Avatar
                </label>

                {/* Upload button */}
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    borderRadius: 10,
                    border: "2px dashed var(--accent-primary)",
                    background: "rgba(200,116,42,0.06)",
                    color: "var(--accent-secondary)",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    marginBottom: "0.6rem",
                    fontWeight: 500,
                  }}
                >
                  📷 Upload Photo from Device
                </button>

                {/* OR divider */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                  <span style={{ fontSize: "0.75rem", opacity: 0.5 }}>OR paste URL</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                </div>

                <input
                  name="avatar"
                  value={form.avatar.startsWith("data:") ? "" : form.avatar}
                  onChange={handleChange}
                  placeholder="https://any-image-url.com/photo.jpg"
                  style={{ width: "100%" }}
                />

                {/* Preview */}
                {avatarPreview && (
                  <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <img
                      src={avatarPreview}
                      alt="preview"
                      onError={(e) => { e.target.src = "https://i.imgur.com/HeIi0wU.png"; }}
                      style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-primary)" }}
                    />
                    <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>Avatar preview</span>
                    <button
                      onClick={() => { setForm((p) => ({ ...p, avatar: "" })); setAvatarPreview(null); }}
                      style={{ marginLeft: "auto", background: "none", color: "#f87171", cursor: "pointer", fontSize: "0.8rem" }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="glass" style={{ padding: "2rem" }}>
              <h2 style={{ marginBottom: "1.5rem", fontSize: "1.2rem" }}>Bio</h2>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell the community about yourself..."
                rows={5}
                style={{ width: "100%", resize: "vertical" }}
              />
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Skills */}
            <div className="glass" style={{ padding: "2rem" }}>
              <h2 style={{ marginBottom: "1.5rem", fontSize: "1.2rem" }}>Skills</h2>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill (press Enter)"
                  style={{ flex: 1, marginBottom: 0 }}
                />
                <button className="primary-btn" onClick={addSkill} style={{ whiteSpace: "nowrap" }}>Add</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {form.skills.length === 0 ? (
                  <p style={{ fontSize: "0.88rem", opacity: 0.5 }}>No skills added yet.</p>
                ) : form.skills.map((skill) => (
                  <span key={skill} style={{
                    padding: "0.35rem 0.85rem",
                    borderRadius: 999,
                    background: "rgba(200,116,42,0.12)",
                    color: "var(--accent-secondary)",
                    border: "1px solid rgba(200,116,42,0.25)",
                    display: "flex", alignItems: "center", gap: "0.4rem",
                    fontSize: "0.88rem",
                  }}>
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      style={{ background: "none", color: "inherit", cursor: "pointer", padding: 0, fontSize: "1rem", lineHeight: 1 }}
                    >×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="glass" style={{ padding: "2rem" }}>
              <h2 style={{ marginBottom: "1.5rem", fontSize: "1.2rem" }}>Social Links</h2>
              {[
                { label: "GitHub",    name: "github",    placeholder: "https://github.com/...",    icon: "🐙" },
                { label: "LinkedIn",  name: "linkedin",  placeholder: "https://linkedin.com/in/...", icon: "💼" },
                { label: "Portfolio", name: "portfolio", placeholder: "https://yoursite.com",        icon: "🌐" },
              ].map(({ label, name, placeholder, icon }) => (
                <div key={name} style={{ marginBottom: "1rem" }}>
                  <label style={{ fontSize: "0.85rem", display: "block", marginBottom: "0.3rem", opacity: 0.75 }}>
                    {icon} {label}
                  </label>
                  <input
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    style={{ width: "100%" }}
                  />
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <button
              className="primary-btn"
              onClick={handleSave}
              disabled={saving}
              style={{ width: "100%", padding: "1rem", fontSize: "1rem", fontWeight: 700 }}
            >
              {saving ? "Saving..." : "Save Profile ✅"}
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate(`/profile/${profile?._id}`)}
              style={{ width: "100%" }}
            >
              View Public Profile →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;