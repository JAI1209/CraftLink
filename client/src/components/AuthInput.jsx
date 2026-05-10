const AuthInput = ({
  type,
  placeholder,
  label,
  name,
  value,
  onChange,
}) => {
  return (
    <div
      style={{
        marginBottom: "1.2rem",
      }}
    >
      <label
        style={{
          display: "block",
          marginBottom: ".5rem",
          fontSize: ".95rem",
        }}
      >
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "1rem",
          borderRadius: "14px",
          border:
            "1px solid rgba(255,255,255,0.08)",
          background:
            "rgba(255,255,255,0.03)",
          color: "white",
          outline: "none",
          fontSize: "1rem",
        }}
      />
    </div>
  );
};

export default AuthInput;