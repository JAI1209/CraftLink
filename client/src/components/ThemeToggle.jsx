import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      onClick={toggleTheme}
      style={styles.button}
    >
      <span
        style={{
          ...styles.thumb,
          transform: isDark ? "translateX(0)" : "translateX(24px)",
        }}
      >
        {isDark ? (
          <Moon size={14} strokeWidth={2} />
        ) : (
          <Sun size={14} strokeWidth={2} />
        )}
      </span>
    </button>
  );
};

const styles = {
  button: {
    width: 58,
    height: 34,
    padding: 4,
    borderRadius: "var(--r-full)",
    border: "1px solid var(--border)",
    background: "var(--surface-2)",
    color: "var(--lime)",
    display: "inline-flex",
    alignItems: "center",
    transition: "background var(--t-med), border-color var(--t-med), color var(--t-med)",
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "var(--surface-0)",
    border: "1px solid var(--border-hi)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "var(--shadow-sm)",
    transition: "transform var(--t-med), background var(--t-med), border-color var(--t-med)",
  },
};

export default ThemeToggle;
