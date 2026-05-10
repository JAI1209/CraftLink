import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import axios from "axios";
import toast from "react-hot-toast";

import AuthInput from "../components/AuthInput";

import background from "../assets/image/background.png";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  // HANDLE LOGIN
  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    try {
      const { data } =
        await axios.post(
          "http://localhost:5000/api/auth/login",
          formData
        );

      // SAVE TOKEN IN CONTEXT
      login(data.token);

      toast.success(
        "Login successful 🚀"
      );

      // REDIRECT
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data
          ?.message ||
          "Login failed"
      );
    }
  };

  return (
    <section
      className="section"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        backgroundImage: `
          linear-gradient(
            rgba(0,0,0,0.45),
            rgba(0,0,0,0.45)
          ),
          url(${background})
        `,

        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container">
        <div
          className="glass"
          style={{
            maxWidth: "500px",
            margin: "0 auto",
            padding: "3rem",
            backdropFilter:
              "blur(18px)",
            border:
              "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            <h1
              style={{
                marginBottom: ".7rem",
                fontSize: "2.5rem",
              }}
            >
              Welcome Back
            </h1>

            <p>
              Login to continue your
              journey on CraftLink.
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
          >
            <AuthInput
              label="Email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />

            <AuthInput
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={
                formData.password
              }
              onChange={handleChange}
            />

            {/* OPTIONS */}
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
                gap: ".7rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: ".5rem",
                }}
              >
                <input
                  type="checkbox"
                  style={{
                    width: "16px",
                    height: "16px",
                  }}
                />

                <p
                  style={{
                    fontSize: ".92rem",
                  }}
                >
                  Remember me
                </p>
              </div>

              <span
                style={{
                  fontSize: ".92rem",
                  color: "#7c8cff",
                  cursor: "pointer",
                }}
              >
                Forgot Password?
              </span>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="primary-btn"
              style={{
                width: "100%",
              }}
            >
              Login
            </button>
          </form>

          {/* FOOTER */}
          <div
            style={{
              marginTop: "2rem",
              textAlign: "center",
            }}
          >
            <p>
              Don&apos;t have an
              account?{" "}
              <Link to="/register">
                <span
                  style={{
                    color: "#7c8cff",
                    fontWeight:
                      "600",
                    cursor:
                      "pointer",
                  }}
                >
                  Register
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;