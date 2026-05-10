import SkillCard from "../components/SkillCard";
import { skills } from "../data/dummySkills";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div>
      {/* HERO SECTION */}
      <section className="section">
        <div className="container">
          <motion.div
            className="glass"
            initial={{
              opacity: 0,
              y: 50,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
            }}
            style={{
              padding: "4rem",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <h1
              style={{
                fontSize: "4rem",
                marginBottom: "1rem",
                background:
                  "linear-gradient(135deg,#7c8cff,#8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              CraftLink
            </h1>

            <p
              style={{
                maxWidth: "700px",
                margin: "0 auto",
                fontSize: "1.1rem",
                marginBottom: "2rem",
              }}
            >
              Link people via their craft. Discover
              talented freelancers, exchange skills,
              collaborate on projects, and grow your
              creative network.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <button className="primary-btn">
                Explore Skills
              </button>

              <button className="secondary-btn">
                Join Community
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="section">
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(220px,1fr))",
              gap: "1.5rem",
            }}
          >
            {[
              {
                title: "10K+",
                subtitle: "Active Freelancers",
              },
              {
                title: "25K+",
                subtitle: "Skill Exchanges",
              },
              {
                title: "4.9★",
                subtitle: "Community Rating",
              },
              {
                title: "100+",
                subtitle: "Skill Categories",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="glass"
                whileHover={{
                  y: -8,
                  scale: 1.03,
                }}
                transition={{
                  duration: 0.25,
                }}
                style={{
                  padding: "2rem",
                  textAlign: "center",
                }}
              >
                <h2
                  style={{
                    fontSize: "2rem",
                    marginBottom: ".5rem",
                  }}
                >
                  {item.title}
                </h2>

                <p>{item.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <div
            style={{
              textAlign: "center",
              marginBottom: "3rem",
            }}
          >
            <h2
              style={{
                fontSize: "2.5rem",
                marginBottom: "1rem",
              }}
            >
              Popular Categories
            </h2>

            <p>
              Explore trending skills and connect with
              professionals worldwide.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(220px,1fr))",
              gap: "1.5rem",
            }}
          >
            {[
              "Web Development",
              "Graphic Design",
              "Video Editing",
              "UI/UX Design",
              "Content Writing",
              "Digital Marketing",
            ].map((category, index) => (
              <motion.div
                key={index}
                className="glass"
                whileHover={{
                  y: -8,
                  scale: 1.03,
                }}
                transition={{
                  duration: 0.25,
                }}
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <h3>{category}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED SKILLS */}
      <section className="section">
        <div className="container">
          <div
            style={{
              textAlign: "center",
              marginBottom: "3rem",
            }}
          >
            <h2
              style={{
                fontSize: "2.5rem",
                marginBottom: "1rem",
              }}
            >
              Featured Skills
            </h2>

            <p>
              Discover high-quality talent from the
              CraftLink community.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(300px,1fr))",
              gap: "1.5rem",
            }}
          >
            {skills.map((skill) => (
              <SkillCard
                key={skill.id}
                title={skill.title}
                category={skill.category}
                price={skill.price}
                rating={skill.rating}
                username={skill.username}
              />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="container">
          <div
            style={{
              textAlign: "center",
              marginBottom: "3rem",
            }}
          >
            <h2
              style={{
                fontSize: "2.5rem",
                marginBottom: "1rem",
              }}
            >
              How CraftLink Works
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(250px,1fr))",
              gap: "1.5rem",
            }}
          >
            {[
              {
                title: "Create Profile",
                desc: "Build your professional identity and showcase your skills.",
              },
              {
                title: "Connect",
                desc: "Find talented creators, developers, and freelancers.",
              },
              {
                title: "Collaborate",
                desc: "Exchange skills and work on amazing projects together.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="glass"
                whileHover={{
                  y: -8,
                  scale: 1.02,
                }}
                transition={{
                  duration: 0.25,
                }}
                style={{
                  padding: "2rem",
                }}
              >
                <h3
                  style={{
                    marginBottom: "1rem",
                  }}
                >
                  {step.title}
                </h3>

                <p>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <motion.div
            className="glass"
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.6,
            }}
            style={{
              padding: "4rem",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "3rem",
                marginBottom: "1rem",
              }}
            >
              Ready to Build Your Network?
            </h2>

            <p
              style={{
                maxWidth: "700px",
                margin: "0 auto",
                marginBottom: "2rem",
              }}
            >
              Join thousands of creators and
              professionals collaborating through
              skills and opportunities.
            </p>

            <button className="primary-btn">
              Get Started Today
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;