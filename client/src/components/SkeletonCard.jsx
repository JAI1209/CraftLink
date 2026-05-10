const SkeletonCard = () => {
  return (
    <div
      className="glass"
      style={{
        padding: "1.5rem",
        borderRadius: "24px",
        overflow: "hidden",
        animation: "pulse 1.5s infinite",
      }}
    >
      {/* CATEGORY */}
      <div
        style={{
          width: "90px",
          height: "28px",
          borderRadius: "999px",
          background:
            "rgba(255,255,255,0.08)",
          marginBottom: "1rem",
        }}
      />

      {/* TITLE */}
      <div
        style={{
          width: "100%",
          height: "24px",
          borderRadius: "10px",
          background:
            "rgba(255,255,255,0.08)",
          marginBottom: ".8rem",
        }}
      />

      <div
        style={{
          width: "70%",
          height: "24px",
          borderRadius: "10px",
          background:
            "rgba(255,255,255,0.08)",
          marginBottom: "1.5rem",
        }}
      />

      {/* USER */}
      <div
        style={{
          width: "120px",
          height: "18px",
          borderRadius: "10px",
          background:
            "rgba(255,255,255,0.08)",
          marginBottom: "2rem",
        }}
      />

      {/* FOOTER */}
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
        }}
      >
        <div
          style={{
            width: "70px",
            height: "22px",
            borderRadius: "10px",
            background:
              "rgba(255,255,255,0.08)",
          }}
        />

        <div
          style={{
            width: "60px",
            height: "22px",
            borderRadius: "999px",
            background:
              "rgba(255,255,255,0.08)",
          }}
        />
      </div>
    </div>
  );
};

export default SkeletonCard;