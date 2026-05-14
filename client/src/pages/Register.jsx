import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password min 6 characters");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", form);
      login(data.token, data.user);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"90vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
      <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:600, height:600, background:"radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 65%)", pointerEvents:"none", zIndex:0 }} />

      <div style={{ width:"100%", maxWidth:420, position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <Link to="/" style={{ display:"inline-flex", alignItems:"center", gap:"0.6rem", marginBottom:"2rem" }}>
            <div style={{ width:36, height:36, borderRadius:"var(--r-sm)", background:"var(--lime)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Zap size={18} strokeWidth={2.2} fill="#080808" style={{ color: "#080808" }} />
            </div>
            <span style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1.2rem" }}>CraftLink</span>
          </Link>
          <h2 style={{ marginBottom:"0.5rem" }}>Create your account</h2>
          <p style={{ color:"var(--muted)", fontSize:"0.9rem" }}>Join the craft community today</p>
        </div>

        <div className="glass" style={{ padding:"2.5rem" }}>
          <form onSubmit={handle} style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            {[
              { key:"name", label:"FULL NAME", type:"text", ph:"Jai Sharma" },
              { key:"email", label:"EMAIL", type:"email", ph:"you@example.com" },
              { key:"password", label:"PASSWORD", type:"password", ph:"Min 6 characters" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display:"block", fontSize:"0.8rem", fontFamily:"var(--font-mono)", color:"var(--muted)", marginBottom:"0.4rem", letterSpacing:"0.05em" }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e => setForm({...form, [f.key]:e.target.value})} placeholder={f.ph} required />
              </div>
            ))}
            <button type="submit" className="primary-btn" disabled={loading} style={{ width:"100%", padding:"0.9rem", marginTop:"0.5rem", fontSize:"0.92rem", justifyContent:"center" }}>
              {loading ? "Creating..." : "Create account →"}
            </button>
          </form>
          <p style={{ textAlign:"center", marginTop:"1.5rem", fontSize:"0.85rem", color:"var(--muted)" }}>
            Already a member?{" "}
            <Link to="/login" style={{ color:"var(--lime)", fontWeight:600 }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
