import DashboardSidebar from "../components/DashboardSidebar";

const Dashboard = () => {
  return (
    <section className="section">
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "260px 1fr",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* SIDEBAR */}
          <DashboardSidebar />

          {/* MAIN CONTENT */}
          <div>
            {/* HEADER */}
            <div
              className="glass"
              style={{
                padding: "2rem",
                marginBottom: "2rem",
              }}
            >
              <h1
                style={{
                  marginBottom: ".7rem",
                }}
              >
                Welcome Back, Jai 👋
              </h1>

              <p>
                Manage your profile, skills, and
                collaborations from one place.
              </p>
            </div>

            {/* STATS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(220px,1fr))",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              {[
                {
                  title: "12",
                  subtitle: "Active Skills",
                },
                {
                  title: "48",
                  subtitle: "Connections",
                },
                {
                  title: "8",
                  subtitle: "Pending Requests",
                },
                {
                  title: "4.9★",
                  subtitle: "Profile Rating",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="glass"
                  style={{
                    padding: "2rem",
                  }}
                >
                  <h2
                    style={{
                      marginBottom: ".5rem",
                      fontSize: "2rem",
                    }}
                  >
                    {item.title}
                  </h2>

                  <p>{item.subtitle}</p>
                </div>
              ))}
            </div>

            {/* QUICK ACTIONS */}
            <div
              className="glass"
              style={{
                padding: "2rem",
                marginBottom: "2rem",
              }}
            >
              <h2
                style={{
                  marginBottom: "1.5rem",
                }}
              >
                Quick Actions
              </h2>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <button className="primary-btn">
                  Add New Skill
                </button>

                <button className="secondary-btn">
                  Edit Profile
                </button>

                <button className="secondary-btn">
                  View Messages
                </button>
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div
              className="glass"
              style={{
                padding: "2rem",
              }}
            >
              <h2
                style={{
                  marginBottom: "1.5rem",
                }}
              >
                Recent Activity
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {[
                  "New collaboration request received",
                  "Your profile got 12 new views",
                  "Frontend skill listing updated",
                  "You received a new message",
                ].map((activity, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "1rem",
                      borderRadius: "14px",
                      background:
                        "rgba(255,255,255,0.03)",
                    }}
                  >
                    {activity}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;