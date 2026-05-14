import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useMessageUnread } from "../context/MessageUnreadContext";
//import CursorTrail from "../components/CursorTrail";
import NotificationBell from "../components/NotificationBell";
import ThemeToggle from "../components/ThemeToggle";

/* ─── ICONS (inline SVG) ──────────────────────────────────────────────────── */
const IconHome   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconSearch = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconGrid   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconInbox  = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>;
const IconMsg    = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const IconUser   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconPlus   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconMenu   = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IconX      = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconSaved  = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>;
const IconNotes  = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;

/* ─── LOGO ANIMATION STYLES ───────────────────────────────────────────────── */
const logoStyles = `
  @keyframes logoGlowPulse {
    0%, 100% {
      box-shadow:
        0 0 5px 1px rgba(180, 255, 0, 0.14),
        0 0 12px 2px rgba(180, 255, 0, 0.06);
    }
    50% {
      box-shadow:
        0 0 10px 2px rgba(180, 255, 0, 0.32),
        0 0 22px 5px rgba(180, 255, 0, 0.12);
    }
  }

  @keyframes logoAurora {
    0%   { opacity: 0.30; transform: scale(1)    rotate(0deg);   }
    50%  { opacity: 0.48; transform: scale(1.06) rotate(180deg); }
    100% { opacity: 0.30; transform: scale(1)    rotate(360deg); }
  }

  @keyframes logoFloat {
    0%   { transform: translateY(0px);    }
    50%  { transform: translateY(-1.2px); }
    100% { transform: translateY(0px);    }
  }

  @keyframes shimmer {
    from { background-position: 200% center; }
    to   { background-position:   0% center; }
  }

  .logo-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    cursor: pointer;
  }

  .logo-icon-container {
    position: relative;
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    animation: logoFloat 5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  }

  .logo-icon-container::before {
    content: "";
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      rgba(180, 255, 0, 0.5),
      rgba(100, 220, 0, 0.2),
      rgba(180, 255, 0, 0.5)
    );
    animation: logoAurora 7s linear infinite;
    filter: blur(6px);
    z-index: 0;
  }

  .logo-icon-container::after {
    content: "";
    position: absolute;
    inset: -3px;
    border-radius: 10px;
    animation: logoGlowPulse 4s ease-in-out infinite;
    z-index: 0;
  }

  .logo-img {
    position: relative;
    z-index: 1;
    width: 34px;
    height: 34px;
    object-fit: contain;
    border-radius: 8px;
    display: block;
  }

  .logo-text {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.1rem;
    letter-spacing: -0.03em;
    color: var(--white);
    position: relative;
    z-index: 1;
  }

  .logo-wrapper:hover .logo-text {
    background: linear-gradient(90deg, var(--white) 0%, var(--lime) 50%, var(--white) 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 1.2s linear forwards;
  }
`;

/* ─── NAVBAR ──────────────────────────────────────────────────────────────── */
const Navbar = () => {
  const { token, logout } = useAuth();
  const { unreadCount } = useMessageUnread();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nl = ({ isActive }) => ({
    display: "flex", alignItems: "center", gap: "0.4rem",
    color: isActive ? "var(--lime)" : "var(--muted)",
    fontWeight: isActive ? "600" : "400",
    fontSize: "0.82rem",
    letterSpacing: "0.01em",
    fontFamily: "var(--font-body)",
    textDecoration: "none",
    padding: "0.35rem 0.6rem",
    borderRadius: "var(--r-sm)",
    transition: "color 0.15s, background 0.15s",
  });

  const NavLinks = ({ close }) => (
    <>
      <NavLink to="/"            style={nl} onClick={close}><IconHome /><span>Home</span></NavLink>
      <NavLink to="/skills"      style={nl} onClick={close}><IconSearch /><span>Explore</span></NavLink>
      {token ? (
        <>
          <NavLink to="/dashboard"    style={nl} onClick={close}><IconGrid /><span>Dashboard</span></NavLink>
          <NavLink to="/requests"     style={nl} onClick={close}><IconInbox /><span>Requests</span></NavLink>
          <NavLink to="/messages"     style={nl} onClick={close}>
            <span style={{ position: "relative", display: "inline-flex" }}>
              <IconMsg />
              {unreadCount > 0 && <span style={messageBadgeStyle}>{unreadCount > 99 ? "99+" : unreadCount}</span>}
            </span>
            <span>Messages</span>
          </NavLink>
          <NavLink to="/notes"        style={nl} onClick={close}><IconNotes /><span>Notes</span></NavLink>
          <NavLink to="/saved-skills" style={nl} onClick={close}><IconSaved /><span>Saved</span></NavLink>
          <NavLink to="/profile"      style={nl} onClick={close}><IconUser /><span>Profile</span></NavLink>
        </>
      ) : null}
    </>
  );

  return (
    <>
      <style>{logoStyles}</style>
      <header style={{
        position: "sticky", top: 0, zIndex: 1000,
        background: scrolled ? "rgba(8,8,8,0.92)" : "rgba(8,8,8,0.6)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${scrolled ? "rgba(248,246,242,0.08)" : "transparent"}`,
        transition: "background 0.3s, border-color 0.3s",
      }}>
        <div className="container">
          <div style={{ height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem" }}>

            {/* LOGO */}
            <Link to="/" className="logo-wrapper">
              <div className="logo-icon-container">
                <img src="/icons.png" alt="CraftLink Logo" className="logo-img" />
              </div>
              <span className="logo-text">CraftLink</span>
            </Link>

            {/* DESKTOP NAV */}
            <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <NavLinks close={() => {}} />
            </nav>

            {/* CTA BUTTONS */}
            <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
              {token ? (
                <>
                  <NotificationBell />
                  <ThemeToggle />
                  <Link to="/add-skill">
                    <button className="primary-btn" style={{ padding: "0.6rem 1.2rem", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <IconPlus /> New Skill
                    </button>
                  </Link>
                  <button className="secondary-btn" style={{ padding: "0.6rem 1.1rem", fontSize: "0.82rem" }} onClick={logout}>
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <Link to="/login"><button className="secondary-btn" style={{ padding: "0.6rem 1.1rem", fontSize: "0.82rem" }}>Sign in</button></Link>
                  <Link to="/register"><button className="primary-btn" style={{ padding: "0.6rem 1.2rem", fontSize: "0.82rem" }}>Get started</button></Link>
                </>
              )}
            </div>

            {/* MOBILE TOGGLE */}
            <button
              className="mobile-menu-btn"
              onClick={() => setOpen(!open)}
              style={{ background: "transparent", color: "var(--white)", border: "none", cursor: "pointer", padding: "0.4rem", display: "none" }}
            >
              {open ? <IconX /> : <IconMenu />}
            </button>
          </div>

          {/* MOBILE MENU */}
          {open && (
            <div style={{
              padding: "1rem", marginBottom: "0.5rem",
              background: "var(--surface-1)", borderRadius: "var(--r-lg)",
              border: "1px solid var(--border)",
              display: "flex", flexDirection: "column", gap: "0.25rem",
            }} className="anim-scale">
              <NavLinks close={() => setOpen(false)} />
              <hr className="divider" style={{ margin: "0.5rem 0" }} />
              {token ? (
                <>
                  <div style={{ display: "flex", justifyContent: "flex-end", padding: "0.25rem 0 0.5rem" }}>
                    <NotificationBell onNavigate={() => setOpen(false)} />
                    <ThemeToggle />
                  </div>
                  <Link to="/add-skill" onClick={() => setOpen(false)}>
                    <button className="primary-btn" style={{ width: "100%", justifyContent: "center" }}><IconPlus /> New Skill</button>
                  </Link>
                  <button className="secondary-btn" style={{ width: "100%" }} onClick={() => { logout(); setOpen(false); }}>Sign out</button>
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <Link to="/login" onClick={() => setOpen(false)}><button className="secondary-btn" style={{ width: "100%" }}>Sign in</button></Link>
                  <Link to="/register" onClick={() => setOpen(false)}><button className="primary-btn" style={{ width: "100%" }}>Get started</button></Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
};

/* ─── FOOTER ──────────────────────────────────────────────────────────────── */
const Footer = () => (
  <footer style={{ borderTop: "1px solid var(--border)", background: "var(--surface-0)", paddingBlock: "3rem 2rem" }}>
    <div className="container">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2rem", marginBottom: "3rem" }}>

        {/* BRAND */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
            <div style={{ width: 28, height: 28, borderRadius: "var(--r-sm)", overflow: "hidden", background: "transparent" }}>
              <img src="/icons.png" alt="CraftLink" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem" }}>CraftLink</span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.7 }}>
            Link people via their craft. A skill exchange and freelance community built on MERN.
          </p>
        </div>

        {/* PLATFORM LINKS */}
        <div>
          <p style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1rem" }}>Platform</p>
          {[["Explore Skills", "/skills"], ["Dashboard", "/dashboard"], ["Requests", "/requests"], ["Messages", "/messages"], ["Shared Notes", "/notes"]].map(([label, path]) => (
            <Link key={label} to={path}
              style={{ display: "block", fontSize: "0.875rem", color: "var(--off-white)", marginBottom: "0.6rem", transition: "color var(--t-fast)" }}
              onMouseEnter={e => e.target.style.color = "var(--lime)"}
              onMouseLeave={e => e.target.style.color = "var(--off-white)"}>
              {label}
            </Link>
          ))}
        </div>

        {/* ACCOUNT LINKS */}
        <div>
          <p style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1rem" }}>Account</p>
          {[["Sign in", "/login"], ["Register", "/register"], ["Profile", "/profile"], ["Add Skill", "/add-skill"]].map(([label, path]) => (
            <Link key={label} to={path}
              style={{ display: "block", fontSize: "0.875rem", color: "var(--off-white)", marginBottom: "0.6rem", transition: "color var(--t-fast)" }}
              onMouseEnter={e => e.target.style.color = "var(--lime)"}
              onMouseLeave={e => e.target.style.color = "var(--off-white)"}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>© 2026 CraftLink. Built for Internshala FSD Capstone.</p>
        <p style={{ fontSize: "0.75rem", color: "var(--subtle)", fontFamily: "var(--font-mono)" }}>v1.0.0</p>
      </div>
    </div>
  </footer>
);

const messageBadgeStyle = {
  position: "absolute",
  top: -9,
  right: -10,
  minWidth: 16,
  height: 16,
  paddingInline: 4,
  borderRadius: 999,
  background: "var(--lime)",
  color: "var(--ink)",
  border: "2px solid var(--surface-0)",
  fontSize: "0.62rem",
  fontWeight: 900,
  lineHeight: "12px",
  textAlign: "center",
};

/* ─── LAYOUT ──────────────────────────────────────────────────────────────── */
const MainLayout = ({ children }) => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    
    <Navbar />
    <main style={{ flex: 1, width: "100%" }}>{children}</main>
    <Footer />
  </div>
);

export default MainLayout;
       