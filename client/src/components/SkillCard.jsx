import { useState } from "react";
import { motion } from "framer-motion";

const SkillCard = ({
  title,
  category,
  price,
  rating,
  username,
}) => {
  const [favorite, setFavorite] =
    useState(false);

  return (
    <motion.div
      className="glass"
      whileHover={{
        y: -10,
        scale: 1.02,
      }}
      transition={{
        duration: 0.25,
      }}
      style={{
        padding: "1.5rem",
        borderRadius: "24px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* FAVORITE BUTTON */}
      <button
        onClick={() =>
          setFavorite(!favorite)
        }
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          border: "none",
          background:
            "rgba(255,255,255,0.08)",
          backdropFilter: "blur(10px)",
          fontSize: "1.1rem",
          cursor: "pointer",
        }}
      >
        {favorite ? "❤️" : "🤍"}
      </button>

      {/* GLOW */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "140px",
          height: "140px",
          background:
            "rgba(124,140,255,0.12)",
          filter: "blur(60px)",
          borderRadius: "50%",
        }}
      />

      {/* CATEGORY */}
      <span
        style={{
          display: "inline-block",
          padding: ".45rem .9rem",
          borderRadius: "999px",
          background:
            "rgba(124,140,255,0.12)",
          color: "#a5b4fc",
          fontSize: ".85rem",
          marginBottom: "1rem",
        }}
      >
        {category}
      </span>

      {/* TITLE */}
      <h3
        style={{
          marginBottom: "1rem",
          fontSize: "1.35rem",
          lineHeight: "1.4",
        }}
      >
        {title}
      </h3>

      {/* USER */}
      <p
        style={{
          marginBottom: "1rem",
          fontSize: ".95rem",
        }}
      >
        by{" "}
        <span
          style={{
            color: "#7c8cff",
            fontWeight: "600",
          }}
        >
          {username}
        </span>
      </p>

      {/* FOOTER */}
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginTop: "1.5rem",
        }}
      >
        {/* PRICE */}
        <h4
          style={{
            fontSize: "1.1rem",
          }}
        >
          ${price}
        </h4>

        {/* RATING */}
        <div
          style={{
            padding: ".45rem .8rem",
            borderRadius: "999px",
            background:
              "rgba(255,255,255,0.05)",
            fontSize: ".9rem",
          }}
        >
          ⭐ {rating}
        </div>
      </div>
    </motion.div>
  );
};

export default SkillCard;