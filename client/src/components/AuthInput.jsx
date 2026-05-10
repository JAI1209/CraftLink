const AuthInput = ({
  type,
  placeholder,
  label,
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
        placeholder={placeholder}
      />
    </div>
  );
};

export default AuthInput;