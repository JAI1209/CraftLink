import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import axios from "axios";
import toast from "react-hot-toast";

import AuthInput from "../components/AuthInput";

import background from "../assets/image/background.png";

import female from "../assets/avatar/female.png";
import male from "../assets/avatar/male.png";
import trans from "../assets/avatar/trans.png";

const Register = () => {
  const navigate = useNavigate();

  const [selectedAvatar, setSelectedAvatar] =
    useState(female);

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  // HANDLE REGISTER
  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    // PASSWORD CHECK
    if (
      formData.password !==
      formData.confirmPassword
    ) {
      return toast.error(
        "Passwords do not match"
      );
    }

    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name: formData.name,
          email: formData.email,
          password:
            formData.password,
          avatar: selectedAvatar,
        }
      );

      toast.success(
        "Registration successful 🚀"
      );

      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data
          ?.message ||
          "Registration failed"
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
            maxWidth: "550px",
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
              Create Account
            </h1>

            <p>
              Join CraftLink and start
              connecting with creators
              and freelancers.
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
          >
            <AuthInput
              label="Full Name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />

            <AuthInput
              label="Email Address"
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
              placeholder="Create a password"
              value={
                formData.password
              }
              onChange={handleChange}
            />

            <AuthInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={
                formData.confirmPassword
              }
              onChange={handleChange}
            />

            {/* AVATAR SECTION */}
            <div
              style={{
                marginBottom: "1.5rem",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: ".8rem",
                  fontSize: ".95rem",
                }}
              >
                Choose Avatar
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                {[
                  female,
                  male,
                  trans,
                ].map(
                  (
                    avatar,
                    index
                  ) => (
                    <div
                      key={index}
                      onClick={() =>
                        setSelectedAvatar(
                          avatar
                        )
                      }
                      className="glass"
                      style={{
                        width: "75px",
                        height: "75px",
                        borderRadius:
                          "50%",
                        cursor: "pointer",
                        border:
                          selectedAvatar ===
                          avatar
                            ? "2px solid #7c8cff"
                            : "2px solid rgba(255,255,255,0.08)",
                        overflow:
                          "hidden",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        transition:
                          "0.3s ease",
                      }}
                    >
                      <img
                        src={avatar}
                        alt="avatar"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit:
                            "cover",
                        }}
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            {/* TERMS */}
            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: ".7rem",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
              }}
            >
              <input
                type="checkbox"
                required
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
                I agree to the terms
                and conditions.
              </p>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="primary-btn"
              style={{
                width: "100%",
              }}
            >
              Create Account
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
              Already have an
              account?{" "}
              <Link to="/login">
                <span
                  style={{
                    color: "#7c8cff",
                    fontWeight:
                      "600",
                    cursor:
                      "pointer",
                  }}
                >
                  Login
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;