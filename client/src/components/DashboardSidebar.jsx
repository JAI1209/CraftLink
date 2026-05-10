import { Link } from "react-router-dom";

const DashboardSidebar = () => {
  return (
    <div
      className="glass"
      style={{
        padding: "2rem",
        height: "fit-content",
        position: "sticky",
        top: "100px",
      }}
    >
      {/* TITLE */}
      <h2
        style={{
          marginBottom: "2rem",
        }}
      >
        Dashboard
      </h2>

      {/* NAVIGATION */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <Link to="/dashboard">
          <button
            className="primary-btn"
            style={{
              width: "100%",
            }}
          >
            Overview
          </button>
        </Link>

        <Link to="/profile">
          <button
            className="secondary-btn"
            style={{
              width: "100%",
            }}
          >
            Profile
          </button>
        </Link>

        <Link to="/skills">
          <button
            className="secondary-btn"
            style={{
              width: "100%",
            }}
          >
            Explore Skills
          </button>
        </Link>

        <Link to="/messages">
          <button
            className="secondary-btn"
            style={{
              width: "100%",
            }}
          >
            Messages
          </button>
        </Link>

        <Link to="/login">
          <button
            className="secondary-btn"
            style={{
              width: "100%",
            }}
          >
            Logout
          </button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardSidebar;