import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Fill in all fields");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", form);
      login(data.token, data.user);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"90vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
      {/* BG glow */}
      <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:600, height:600, background:"radial-gradient(circle,rgba(200,241,53,0.07) 0%,transparent 65%)", pointerEvents:"none", zIndex:0 }} />

      <div style={{ width:"100%", maxWidth:420, position:"relative", zIndex:1 }}>
        {/* LOGO */}
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <Link to="/" style={{ display:"inline-flex", alignItems:"center", gap:"0.6rem", marginBottom:"2rem" }}>
            <div style={{ width:36, height:36, borderRadius:"var(--r-sm)", background:"var(--lime)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Zap size={18} strokeWidth={2.2} fill="#080808" style={{ color: "#080808" }} />
            </div>
            <span style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:"1.2rem" }}>CraftLink</span>
          </Link>
          <h2 style={{ marginBottom:"0.5rem" }}>Welcome back</h2>
          <p style={{ color:"var(--muted)", fontSize:"0.9rem" }}>Sign in to your account</p>
        </div>

        <div className="glass" style={{ padding:"2.5rem" }}>
          <form onSubmit={handle} style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            <div>
              <label style={{ display:"block", fontSize:"0.8rem", fontFamily:"var(--font-mono)", color:"var(--muted)", marginBottom:"0.4rem", letterSpacing:"0.05em" }}>EMAIL</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="you@example.com" required />
            </div>
            <div>
              <label style={{ display:"block", fontSize:"0.8rem", fontFamily:"var(--font-mono)", color:"var(--muted)", marginBottom:"0.4rem", letterSpacing:"0.05em" }}>PASSWORD</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} placeholder="••••••••" required />
            </div>
            <button type="submit" className="primary-btn" disabled={loading} style={{ width:"100%", padding:"0.9rem", marginTop:"0.5rem", fontSize:"0.92rem", justifyContent:"center" }}>
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>
          <p style={{ textAlign:"center", marginTop:"1.5rem", fontSize:"0.85rem", color:"var(--muted)" }}>
            No account?{" "}
            <Link to="/register" style={{ color:"var(--lime)", fontWeight:600 }}>Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
