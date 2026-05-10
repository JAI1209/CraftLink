import {
  Link,
  NavLink,
} from "react-router-dom";

import { useState } from "react";

import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const { token, logout } =
    useAuth();

  const navStyle = ({ isActive }) => ({
    color: isActive
      ? "#a5b4fc"
      : "#e5e7eb",
    fontWeight: isActive
      ? "600"
      : "500",
    textDecoration: "none",
  });

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backdropFilter: "blur(16px)",
        background:
          "rgba(10,12,18,0.75)",
        borderBottom:
          "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="container">
        <div
          style={{
            height: "80px",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
          }}
        >
          {/* LOGO */}
          <Link to="/">
            <h2
              style={{
                fontSize: "1.8rem",
                background:
                  "linear-gradient(135deg,#7c8cff,#8b5cf6)",
                WebkitBackgroundClip:
                  "text",
                WebkitTextFillColor:
                  "transparent",
              }}
            >
              CraftLink
            </h2>
          </Link>

          {/* DESKTOP NAV */}
          <div
            className="desktop-nav"
            style={{
              display: "flex",
              gap: "2rem",
              alignItems: "center",
            }}
          >
            <NavLink
              to="/"
              style={navStyle}
            >
              Home
            </NavLink>

            <NavLink
              to="/skills"
              style={navStyle}
            >
              Skills
            </NavLink>

            {token ? (
              <>
                <NavLink
                  to="/dashboard"
                  style={navStyle}
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/messages"
                  style={navStyle}
                >
                  Messages
                </NavLink>

                <NavLink
                  to="/profile"
                  style={navStyle}
                >
                  Profile
                </NavLink>

                <NavLink
                  to="/add-skill"
                  style={navStyle}
                >
                  Add Skill
                </NavLink>

                <button
                  onClick={logout}
                  className="secondary-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="primary-btn">
                    Login
                  </button>
                </Link>

                <Link to="/register">
                  <button className="secondary-btn">
                    Register
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            style={{
              display: "none",
              background:
                "transparent",
              color: "white",
              fontSize: "1.8rem",
              border: "none",
              cursor: "pointer",
            }}
            className="mobile-menu-btn"
          >
            ☰
          </button>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div
            className="glass"
            style={{
              padding: "1.5rem",
              marginBottom: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <NavLink
              to="/"
              style={navStyle}
            >
              Home
            </NavLink>

            <NavLink
              to="/skills"
              style={navStyle}
            >
              Skills
            </NavLink>

            {token ? (
              <>
                <NavLink
                  to="/dashboard"
                  style={navStyle}
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/messages"
                  style={navStyle}
                >
                  Messages
                </NavLink>

                <NavLink
                  to="/profile"
                  style={navStyle}
                >
                  Profile
                </NavLink>

                <NavLink
                  to="/add-skill"
                  style={navStyle}
                >
                  Add Skill
                </NavLink>

                <button
                  onClick={logout}
                  className="secondary-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="primary-btn">
                    Login
                  </button>
                </Link>

                <Link to="/register">
                  <button className="secondary-btn">
                    Register
                  </button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;