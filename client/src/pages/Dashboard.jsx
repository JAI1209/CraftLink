import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import API from "../services/api";

const Dashboard = () => {
  const [user, setUser] =
    useState(null);

  const [skills, setSkills] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // FETCH DATA
  useEffect(() => {
    const fetchData =
      async () => {
        try {
          const token =
            localStorage.getItem(
              "token"
            );

          // FETCH USER
          const userRes =
            await API.get(
              "/auth/me",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          setUser(
            userRes.data
          );

          // FETCH MY SKILLS
          const skillsRes =
            await API.get(
              "/skills/my-skills",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          setSkills(
            skillsRes.data
          );
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };

    fetchData();
  }, []);

  // DELETE SKILL
  const handleDelete =
    async (id) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        await API.delete(
          `/skills/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // UPDATE UI
        setSkills(
          skills.filter(
            (skill) =>
              skill._id !== id
          )
        );

        toast.success(
          "Skill deleted 🚀"
        );
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "Delete failed"
        );
      }
    };

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <h1>
            Loading dashboard...
          </h1>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
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
              marginBottom: "1rem",
            }}
          >
            Welcome back,{" "}
            {user?.name} 👋
          </h1>

          <p>
            Email: {user?.email}
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
          <div
            className="glass"
            style={{
              padding: "2rem",
            }}
          >
            <h2>
              {skills.length}
            </h2>

            <p>
              Active Skills
            </p>
          </div>

          <div
            className="glass"
            style={{
              padding: "2rem",
            }}
          >
            <h2>4.9★</h2>

            <p>
              Profile Rating
            </p>
          </div>
        </div>

        {/* MY SKILLS */}
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
            My Skills
          </h2>

          {skills.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(250px,1fr))",
                gap: "1rem",
              }}
            >
              {skills.map(
                (skill) => (
                  <div
                    key={
                      skill._id
                    }
                    style={{
                      padding:
                        "1.5rem",
                      borderRadius:
                        "16px",
                      background:
                        "rgba(255,255,255,0.03)",
                    }}
                  >
                    <h3
                      style={{
                        marginBottom:
                          ".7rem",
                      }}
                    >
                      {
                        skill.title
                      }
                    </h3>

                    <p
                      style={{
                        marginBottom:
                          ".5rem",
                      }}
                    >
                      {
                        skill.category
                      }
                    </p>

                    <p
                      style={{
                        marginBottom:
                          "1rem",
                      }}
                    >
                      ₹
                      {
                        skill.price
                      }
                    </p>

                    <small>
                      {
                        skill.description
                      }
                    </small>

                    {/* DELETE BUTTON */}
                    <button
                      onClick={() =>
                        handleDelete(
                          skill._id
                        )
                      }
                      className="secondary-btn"
                      style={{
                        marginTop:
                          "1rem",
                        width: "100%",
                      }}
                    >
                      Delete Skill
                    </button>
                  </div>
                )
              )}
            </div>
          ) : (
            <p>
              No skills added yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;