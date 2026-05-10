import {
  useState,
  useEffect,
} from "react";

import axios from "axios";

import SkillCard from "../components/SkillCard";
import SkeletonCard from "../components/SkeletonCard";

const categories = [
  "All",
  "Development",
  "Design",
  "Marketing",
  "Editing",
];

const SkillListings = () => {
  const [skills, setSkills] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");

  const [sortBy, setSortBy] =
    useState("default");

  // FETCH SKILLS
  useEffect(() => {
    const fetchSkills =
      async () => {
        try {
          const { data } =
            await axios.get(
              "http://localhost:5000/api/skills"
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

  // FILTER + SORT
  const filteredSkills = skills
    .filter((skill) => {
      const matchesSearch =
        skill.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        skill.category
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        skill.category ===
          selectedCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    })
    .sort((a, b) => {
      if (sortBy === "price-low") {
        return a.price - b.price;
      }

      if (sortBy === "price-high") {
        return b.price - a.price;
      }

      if (sortBy === "rating") {
        return b.rating - a.rating;
      }

      return 0;
    });

  return (
    <section className="section">
      <div className="container">
        {/* HEADER */}
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
            Explore Skills
          </h1>

          <p>
            Discover talented freelancers and
            creative professionals.
          </p>
        </div>

        {/* SEARCH */}
        <div
          className="glass"
          style={{
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={{
              width: "100%",
              padding: "1rem",
              borderRadius: "14px",
              border:
                "1px solid rgba(255,255,255,0.08)",
              background:
                "rgba(255,255,255,0.03)",
              color: "white",
            }}
          />
        </div>

        {/* FILTERS */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {/* CATEGORY */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  setSelectedCategory(
                    category
                  )
                }
                className={
                  selectedCategory ===
                  category
                    ? "primary-btn"
                    : "secondary-btn"
                }
              >
                {category}
              </button>
            ))}
          </div>

          {/* SORT */}
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value)
            }
            style={{
              padding: "1rem",
              borderRadius: "14px",
              background:
                "rgba(255,255,255,0.04)",
              color: "white",
              border:
                "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <option value="default">
              Sort By
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

            <option value="rating">
              Highest Rated
            </option>
          </select>
        </div>

        {/* RESULTS */}
        <div
          style={{
            marginBottom: "2rem",
          }}
        >
          <p>
            Showing{" "}
            <strong>
              {filteredSkills.length}
            </strong>{" "}
            results
          </p>
        </div>

        {/* GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(300px,1fr))",
            gap: "1.5rem",
          }}
        >
          {loading ? (
            [...Array(6)].map(
              (_, index) => (
                <SkeletonCard
                  key={index}
                />
              )
            )
          ) : filteredSkills.length >
            0 ? (
            filteredSkills.map((skill) => (
              <SkillCard
                key={skill._id}
                title={skill.title}
                category={skill.category}
                price={skill.price}
                rating={skill.rating}
                username={
                  skill.user?.name ||
                  "Unknown"
                }
              />
            ))
          ) : (
            <div
              className="glass"
              style={{
                padding: "2rem",
                textAlign: "center",
              }}
            >
              No skills found.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SkillListings;