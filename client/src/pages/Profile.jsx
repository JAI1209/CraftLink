import { motion } from "framer-motion";

const Profile = () => {
  return (
    <section className="section">
      <div className="container">
        {/* PROFILE HEADER */}
        <motion.div
          className="glass"
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          style={{
            padding: "3rem",
            marginBottom: "2rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* BACKGROUND GLOW */}
          <div
            style={{
              position: "absolute",
              top: "-120px",
              right: "-120px",
              width: "300px",
              height: "300px",
              background:
                "rgba(124,140,255,0.12)",
              filter: "blur(100px)",
              borderRadius: "50%",
            }}
          />

          {/* PROFILE TOP */}
          <div
            style={{
              display: "flex",
              gap: "2rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {/* AVATAR */}
            <div
              style={{
                width: "130px",
                height: "130px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg,#7c8cff,#8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem",
                fontWeight: "700",
              }}
            >
              J
            </div>

            {/* INFO */}
            <div>
              <h1
                style={{
                  marginBottom: ".7rem",
                  fontSize: "2.5rem",
                }}
              >
                Jai Sharma
              </h1>

              <p
                style={{
                  marginBottom: "1rem",
                }}
              >
                Full Stack Developer • UI/UX
                Designer • Freelancer
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <button className="primary-btn">
                  Hire Me
                </button>

                <button className="secondary-btn">
                  Message
                </button>
              </div>
            </div>
          </div>
        </motion.div>

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
              title: "48",
              subtitle: "Projects Completed",
            },
            {
              title: "4.9★",
              subtitle: "Client Rating",
            },
            {
              title: "12K",
              subtitle: "Profile Views",
            },
            {
              title: "6 Years",
              subtitle: "Experience",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="glass"
              whileHover={{
                y: -8,
              }}
              style={{
                padding: "2rem",
                textAlign: "center",
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
            </motion.div>
          ))}
        </div>

        {/* ABOUT */}
        <div
          className="glass"
          style={{
            padding: "2rem",
            marginBottom: "2rem",
          }}
        >
          <h2
            style={{
              marginBottom: "1rem",
            }}
          >
            About Me
          </h2>

          <p>
            Passionate full-stack developer
            focused on building modern,
            scalable, and visually engaging
            digital products. Specialized in
            React, UI/UX design, animations,
            and frontend architecture.
          </p>
        </div>

        {/* SKILLS */}
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
            Skills
          </h2>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            {[
              "React",
              "JavaScript",
              "UI/UX",
              "Node.js",
              "MongoDB",
              "Framer Motion",
              "Figma",
            ].map((skill, index) => (
              <div
                key={index}
                style={{
                  padding: ".8rem 1.2rem",
                  borderRadius: "999px",
                  background:
                    "rgba(124,140,255,0.12)",
                  color: "#a5b4fc",
                }}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* PORTFOLIO */}
        <div>
          <h2
            style={{
              marginBottom: "1.5rem",
            }}
          >
            Portfolio Projects
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(280px,1fr))",
              gap: "1.5rem",
            }}
          >
            {[
              "Modern SaaS Dashboard",
              "3D Portfolio Website",
              "AI Chat Application",
            ].map((project, index) => (
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
                  minHeight: "220px",
                  display: "flex",
                  alignItems: "end",
                }}
              >
                <h3>{project}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;