import { memo, useState } from "react";
import { Star } from "lucide-react";

const StarRating = ({
  rating = 0,
  max = 5,
  onChange,
  size = 20,
  showValue = false,
  disabled = false,
}) => {
  const [hovered, setHovered] = useState(0);
  const activeValue = hovered || rating;
  const interactive = Boolean(onChange) && !disabled;

  return (
    <div style={styles.wrap} aria-label={`${rating} out of ${max} stars`}>
      <div style={styles.stars}>
        {Array.from({ length: max }, (_, index) => {
          const value = index + 1;
          const active = value <= activeValue;

          return (
            <button
              key={value}
              type="button"
              aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
              disabled={!interactive}
              onClick={() => interactive && onChange(value)}
              onMouseEnter={() => interactive && setHovered(value)}
              onMouseLeave={() => interactive && setHovered(0)}
              style={{
                ...styles.starButton,
                width: size + 8,
                height: size + 8,
                cursor: interactive ? "pointer" : "default",
              }}
            >
              <Star
                size={size}
                strokeWidth={2}
                style={{
                  color: active ? "var(--lime)" : "var(--subtle)",
                  fill: active ? "var(--lime)" : "transparent",
                  filter: active ? "drop-shadow(0 0 10px var(--lime-glow))" : "none",
                  transform: hovered === value ? "scale(1.18) rotate(-6deg)" : "scale(1)",
                  transition: "transform 0.16s var(--ease), color 0.16s var(--ease), fill 0.16s var(--ease)",
                }}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span style={styles.value}>
          {Number(rating || 0).toFixed(1)}
        </span>
      )}
    </div>
  );
};

const styles = {
  wrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
  },
  stars: {
    display: "inline-flex",
    alignItems: "center",
    gap: 2,
  },
  starButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    background: "transparent",
    border: "none",
  },
  value: {
    color: "var(--white)",
    fontSize: "0.88rem",
    fontWeight: 800,
    fontFamily: "var(--font-display)",
  },
};

export default memo(StarRating);
