import Navbar from "../components/Navbar";

const MainLayout = ({ children }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* NAVBAR */}
      <Navbar />

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          width: "100%",
        }}
      >
        {children}
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "2rem 0",
          marginTop: "4rem",
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            {/* LEFT */}
            <div>
              <h3
                style={{
                  fontSize: "1.2rem",
                  marginBottom: ".3rem",
                }}
              >
                CraftLink
              </h3>

              <p
                style={{
                  fontSize: ".95rem",
                }}
              >
                Link People Via Their Craft
              </p>
            </div>

            {/* RIGHT */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <a href="/">Home</a>

              <a href="/">Explore</a>

              <a href="/">Community</a>

              <a href="/">Contact</a>
            </div>
          </div>

          {/* BOTTOM */}
          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop:
                "1px solid rgba(255,255,255,0.05)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: ".9rem",
              }}
            >
              © 2026 CraftLink. Built with passion by Jai.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;