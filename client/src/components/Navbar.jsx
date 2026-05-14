import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { token, logout } = useAuth();

  const navStyle = ({ isActive }) => ({
    color: isActive ? "var(--accent-secondary)" : "var(--text-secondary)",
    fontWeight: isActive ? "600" : "500",
    textDecoration: "none",
    fontSize: "0.95rem",
    transition: "color 0.2s",
  });

  const NavLinks = () => (
    <>
      <NavLink to="/" style={navStyle} onClick={() => setMenuOpen(false)}>Home</NavLink>
      <NavLink to="/skills" style={navStyle} onClick={() => setMenuOpen(false)}>Skills</NavLink>
      {token ? (
        <>
          <NavLink to="/dashboard" style={navStyle} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
          <NavLink to="/requests" style={navStyle} onClick={() => setMenuOpen(false)}>Requests</NavLink>
          <NavLink to="/messages" style={navStyle} onClick={() => setMenuOpen(false)}>Messages</NavLink>
          <NavLink to="/saved-skills" style={navStyle} onClick={() => setMenuOpen(false)}>Saved</NavLink>
          <NavLink to="/profile" style={navStyle} onClick={() => setMenuOpen(false)}>Profile</NavLink>
          <NavLink to="/add-skill" style={navStyle} onClick={() => setMenuOpen(false)}>+ Add Skill</NavLink>
          <button onClick={() => { logout(); setMenuOpen(false); }} className="secondary-btn">Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" onClick={() => setMenuOpen(false)}><button className="primary-btn">Login</button></Link>
          <Link to="/register" onClick={() => setMenuOpen(false)}><button className="secondary-btn">Register</button></Link>
        </>
      )}
    </>
  );

  return (
    <nav style={{ position:"sticky", top:0, zIndex:1000, backdropFilter:"blur(16px)", background:"rgba(13,10,7,0.85)", borderBottom:"1px solid var(--border-color)" }}>
      <div className="container">
        <div style={{ height:72, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <Link to="/">
            <h2 style={{ fontSize:"1.6rem", background:"var(--gradient-primary)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              CraftLink
            </h2>
          </Link>

          {/* DESKTOP */}
          <div className="desktop-nav" style={{ display:"flex", gap:"1.5rem", alignItems:"center" }}>
            <NavLinks />
          </div>

          {/* MOBILE TOGGLE */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn"
            style={{ display:"none", background:"transparent", color:"var(--text-primary)", fontSize:"1.6rem", border:"none", cursor:"pointer" }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="glass" style={{ padding:"1.5rem", marginBottom:"1rem", display:"flex", flexDirection:"column", gap:"1rem" }}>
            <NavLinks />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
