import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["Development","Design","Marketing","Editing","UI/UX","Writing","Video","Music","Other"];

const EditSkill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tagInput, setTagInput] = useState("");
  const [formData, setFormData] = useState({
    title:"", category:"", description:"", price:"", type:"offer", mode:"paid", status:"active", tags:[],
  });

  useEffect(() => {
    const fetchSkill = async () => {
      try {
        const { data } = await API.get(`/skills/${id}`);
        setFormData({
          title: data.title || "",
          category: data.category || "",
          description: data.description || "",
          price: data.price || "",
          type: data.type || "offer",
          mode: data.mode || "paid",
          status: data.status || "active",
          tags: data.tags || [],
        });
      } catch { toast.error("Failed to load skill"); navigate("/dashboard"); }
      finally { setLoading(false); }
    };
    fetchSkill();
  }, [id, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || formData.tags.includes(t)) return;
    setFormData(prev => ({ ...prev, tags: [...prev.tags, t] }));
    setTagInput("");
  };

  const removeTag = (tag) => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put(`/skills/${id}`, { ...formData, price: Number(formData.price) }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Skill updated! ✅");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <section className="section"><div className="container"><div className="glass" style={{ padding:"3rem", textAlign:"center" }}><h2>Loading...</h2></div></div></section>;

  return (
    <section className="section">
      <div className="container">
        <div className="glass" style={{ maxWidth:700, margin:"0 auto", padding:"2.5rem" }}>
          <h1 style={{ marginBottom:"2rem" }}>Edit Skill ✏️</h1>
          <form onSubmit={handleSubmit}>
            <label style={{ display:"block", marginBottom:"0.4rem", fontSize:"0.9rem" }}>Skill Title</label>
            <input name="title" value={formData.title} onChange={handleChange} required style={{ marginBottom:"1.2rem" }} />

            <label style={{ display:"block", marginBottom:"0.4rem", fontSize:"0.9rem" }}>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} style={{ marginBottom:"1.2rem" }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label style={{ display:"block", marginBottom:"0.4rem", fontSize:"0.9rem" }}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={5} required style={{ marginBottom:"1.2rem" }} />

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"1rem", marginBottom:"1.2rem" }}>
              <div>
                <label style={{ display:"block", marginBottom:"0.4rem", fontSize:"0.9rem" }}>Price (₹)</label>
                <input name="price" type="number" value={formData.price} onChange={handleChange} required />
              </div>
              <div>
                <label style={{ display:"block", marginBottom:"0.4rem", fontSize:"0.9rem" }}>Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option value="offer">Offering</option>
                  <option value="request">Requesting</option>
                </select>
              </div>
              <div>
                <label style={{ display:"block", marginBottom:"0.4rem", fontSize:"0.9rem" }}>Mode</label>
                <select name="mode" value={formData.mode} onChange={handleChange}>
                  <option value="paid">Paid</option>
                  <option value="barter">Barter</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label style={{ display:"block", marginBottom:"0.4rem", fontSize:"0.9rem" }}>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <label style={{ display:"block", marginBottom:"0.4rem", fontSize:"0.9rem" }}>Tags</label>
            <div style={{ display:"flex", gap:"0.5rem", marginBottom:"0.8rem" }}>
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key==="Enter" && (e.preventDefault(), addTag())} placeholder="Add tags..." style={{ flex:1 }} />
              <button type="button" className="secondary-btn" onClick={addTag}>Add</button>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem", marginBottom:"2rem" }}>
              {formData.tags.map(tag => (
                <span key={tag} style={{ padding:"0.3rem 0.8rem", borderRadius:"999px", background:"rgba(200,116,42,0.12)", color:"var(--accent-secondary)", fontSize:"0.85rem", display:"flex", alignItems:"center", gap:"0.4rem" }}>
                  #{tag} <button type="button" onClick={() => removeTag(tag)} style={{ background:"none", color:"inherit", cursor:"pointer", padding:0 }}>×</button>
                </span>
              ))}
            </div>

            <div style={{ display:"flex", gap:"1rem" }}>
              <button type="submit" className="primary-btn" style={{ flex:1, padding:"1rem" }} disabled={submitting}>
                {submitting ? "Updating..." : "Update Skill ✅"}
              </button>
              <button type="button" className="secondary-btn" style={{ flex:1, padding:"1rem" }} onClick={() => navigate("/dashboard")}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default EditSkill;
