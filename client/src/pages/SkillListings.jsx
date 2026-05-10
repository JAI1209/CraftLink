import {
  useEffect,
  useState,
} from "react";

import API from "../services/api";

const SkillListings = () => {
  const [skills, setSkills] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All");

  // FETCH SKILLS
  useEffect(() => {
    const fetchSkills =
      async () => {
        try {
          const { data } =
            await API.get(
              "/skills"
            );

          setSkills(data);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };

    fetchSkills();
  }, []);

  // FILTER SKILLS
  const filteredSkills =
    skills.filter((skill) => {
      const matchesSearch =
        skill.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesCategory =
        category === "All"
          ? true
          : skill.category ===
            category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <h1>
            Loading skills...
          </h1>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        {/* PAGE TITLE */}
        <div
          style={{
            marginBottom: "3rem",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "3rem",
              marginBottom: "1rem",
            }}
          >
            Explore Skills 🚀
          </h1>

          <p>
            Discover talented
            creators and services.
          </p>
        </div>

        {/* FILTERS */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            style={{
              flex: 1,
              minWidth: "250px",
              padding: "1rem",
              borderRadius:
                "14px",
              border:
                "1px solid rgba(255,255,255,0.08)",
              background:
                "rgba(255,255,255,0.03)",
              color: "white",
              outline: "none",
            }}
          />

          {/* CATEGORY */}
          <select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
            style={{
              padding: "1rem",
              borderRadius:
                "14px",
              border:
                "1px solid rgba(255,255,255,0.08)",
              background:
                "rgba(255,255,255,0.03)",
              color: "white",
              outline: "none",
            }}
          >
            <option value="All">
              All
            </option>

            <option value="Development">
              Development
            </option>

            <option value="Design">
              Design
            </option>

            <option value="Marketing">
              Marketing
            </option>

            <option value="Editing">
              Editing
            </option>
          </select>
        </div>

        {/* SKILLS GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(280px,1fr))",
            gap: "1.5rem",
          }}
        >
          {filteredSkills.length >
          0 ? (
            filteredSkills.map(
              (skill) => (
                <div
                  key={
                    skill._id
                  }
                  className="glass"
                  style={{
                    padding:
                      "1.5rem",
                  }}
                >
                  {/* TITLE */}
                  <h2
                    style={{
                      marginBottom:
                        ".7rem",
                    }}
                  >
                    {
                      skill.title
                    }
                  </h2>

                  {/* CATEGORY */}
                  <p
                    style={{
                      marginBottom:
                        ".5rem",
                      color:
                        "#a5b4fc",
                    }}
                  >
                    {
                      skill.category
                    }
                  </p>

                  {/* DESCRIPTION */}
                  <p
                    style={{
                      marginBottom:
                        "1rem",
                      lineHeight:
                        "1.6",
                    }}
                  >
                    {
                      skill.description
                    }
                  </p>

                  {/* PRICE */}
                  <h3
                    style={{
                      marginBottom:
                        "1rem",
                    }}
                  >
                    ₹
                    {
                      skill.price
                    }
                  </h3>

                  {/* USER */}
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                    }}
                  >
                    <small>
                      By{" "}
                      {
                        skill.user
                          ?.name
                      }
                    </small>

                    <button className="primary-btn">
                      Hire
                    </button>
                  </div>
                </div>
              )
            )
          ) : (
            <h2>
              No skills found 😔
            </h2>
          )}
        </div>
      </div>
    </section>
  );
};

export default SkillListings;