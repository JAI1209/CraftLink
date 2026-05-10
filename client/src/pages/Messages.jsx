const Messages = () => {
  return (
    <section className="section">
      <div className="container">
        <div
          className="glass"
          style={{
            height: "80vh",
            display: "grid",
            gridTemplateColumns:
              "320px 1fr",
            overflow: "hidden",
          }}
        >
          {/* SIDEBAR */}
          <div
            style={{
              borderRight:
                "1px solid rgba(255,255,255,0.06)",
              padding: "1.5rem",
            }}
          >
            <h2
              style={{
                marginBottom: "1.5rem",
              }}
            >
              Messages
            </h2>

            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search chats..."
              style={{
                marginBottom: "1.5rem",
              }}
            />

            {/* CHAT LIST */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {[
                "Alex Johnson",
                "Sarah Smith",
                "Michael Lee",
              ].map((user, index) => (
                <div
                  key={index}
                  className="glass"
                  style={{
                    padding: "1rem",
                    cursor: "pointer",
                  }}
                >
                  <h4
                    style={{
                      marginBottom: ".3rem",
                    }}
                  >
                    {user}
                  </h4>

                  <p
                    style={{
                      fontSize: ".9rem",
                    }}
                  >
                    Hey! Let&apos;s collaborate 🚀
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CHAT AREA */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                padding: "1.5rem",
                borderBottom:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <h3>Alex Johnson</h3>
            </div>

            {/* MESSAGES */}
            <div
              style={{
                flex: 1,
                padding: "1.5rem",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {/* RECEIVED */}
              <div
                style={{
                  maxWidth: "70%",
                  padding: "1rem",
                  borderRadius: "16px",
                  background:
                    "rgba(255,255,255,0.05)",
                }}
              >
                Hey Jai! I saw your frontend work.
              </div>

              {/* SENT */}
              <div
                style={{
                  maxWidth: "70%",
                  padding: "1rem",
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg,#7c8cff,#8b5cf6)",
                  alignSelf: "flex-end",
                }}
              >
                Thanks! Let&apos;s collaborate 🚀
              </div>
            </div>

            {/* INPUT */}
            <div
              style={{
                padding: "1.5rem",
                borderTop:
                  "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                gap: "1rem",
              }}
            >
              <input
                type="text"
                placeholder="Type a message..."
              />

              <button className="primary-btn">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Messages;