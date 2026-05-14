import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["Development","Design","Marketing","Editing","UI/UX","Writing","Video","Music","Other"];

const AddSkill = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [formData, setFormData] = useState({
    title:"", category:"", description:"", price:"", type:"offer", mode:"paid", tags:[],
  });

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
    if (!formData.title || !formData.category || !formData.description || !formData.price) {
      return toast.error("Please fill all required fields");
    }
    setSubmitting(true);
    try {
      await API.post("/skills", { ...formData, price: Number(formData.price) }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Skill listed! 🚀");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add skill");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="glass" style={{ maxWidth:700, margin:"0 auto", padding:"2.5rem" }}>
          <h1 style={{ marginBottom:"0.5rem" }}>List a New Skill</h1>
          <p style={{ marginBottom:"2rem" }}>Share your expertise with the CraftLink community.</p>

          <form onSubmit={handleSubmit}>
            <label style={{ display:"block", marginBottom:"0.4rem", fontSize:"0.9rem" }}>Skill Title *</label>
            <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. React Website Development" style={{ marginBottom:"1.2rem" }} />

            <label style={{ display:"block", marginBottom:"0.4rem", fontSize:"0.9rem" }}>Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} style={{ marginBottom:"1.2rem" }}>
              <option value="">Select Category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label style={{ display:"block", marginBottom:"0.4rem", fontSize:"0.9rem" }}>Description *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe your skill in detail..." rows={5} style={{ marginBottom:"1.2rem" }} />

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"1rem", marginBottom:"1.2rem" }}>
              <div>
                <label style={{ display:"block", marginBottom:"0.4rem", fontSize:"0.9rem" }}>Price (₹) *</label>
                <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="500" />
              </div>
              <div>
                <label style={{ display:"block", marginBottom:"0.4rem", fontSize:"0.9rem" }}>Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option value="offer">I'm Offering</option>
                  <option value="request">I'm Requesting</option>
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
            </div>

            <label style={{ display:"block", marginBottom:"0.4rem", fontSize:"0.9rem" }}>Tags</label>
            <div style={{ display:"flex", gap:"0.5rem", marginBottom:"0.8rem" }}>
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key==="Enter" && (e.preventDefault(), addTag())} placeholder="Add tags (press Enter)" style={{ flex:1 }} />
              <button type="button" className="secondary-btn" onClick={addTag}>Add</button>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem", marginBottom:"2rem" }}>
              {formData.tags.map(tag => (
                <span key={tag} style={{ padding:"0.3rem 0.8rem", borderRadius:"999px", background:"rgba(200,116,42,0.12)", color:"var(--accent-secondary)", fontSize:"0.85rem", display:"flex", alignItems:"center", gap:"0.4rem" }}>
                  #{tag} <button type="button" onClick={() => removeTag(tag)} style={{ background:"none", color:"inherit", cursor:"pointer", padding:0 }}>×</button>
                </span>
              ))}
            </div>

            <button type="submit" className="primary-btn" style={{ width:"100%", padding:"1rem", fontSize:"1rem" }} disabled={submitting}>
              {submitting ? "Listing..." : "List Skill 🚀"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AddSkill;
