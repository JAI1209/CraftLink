import {
  useState,
} from "react";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import toast from "react-hot-toast";

import AuthInput from "../components/AuthInput";

import API from "../services/api";

import {
  useAuth,
} from "../context/AuthContext";

import background from "../assets/image/background.png";

const Register = () => {
  const navigate =
    useNavigate();

  const { login } =
    useAuth();

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
    });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    try {
      const { data } =
        await API.post(
          "/auth/register",
          formData
        );

      login(data.token);

      toast.success(
        "Registration successful 🚀"
      );

      navigate("/dashboard");
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
        justifyContent:
          "center",

        backgroundImage: `
          linear-gradient(
            rgba(0,0,0,0.45),
            rgba(0,0,0,0.45)
          ),
          url(${background})
        `,

        backgroundSize: "cover",
        backgroundPosition:
          "center",
        backgroundRepeat:
          "no-repeat",
      }}
    >
      <div className="container">
        <div
          className="glass"
          style={{
            maxWidth: "500px",
            margin: "0 auto",
            padding: "3rem",
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
                marginBottom:
                  ".7rem",
                fontSize: "2.5rem",
              }}
            >
              Create Account
            </h1>

            <p>
              Join CraftLink and
              start collaborating.
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={
              handleSubmit
            }
          >
            <AuthInput
              label="Name"
              type="text"
              name="name"
              value={
                formData.name
              }
              onChange={
                handleChange
              }
              placeholder="Enter your name"
            />

            <AuthInput
              label="Email"
              type="email"
              name="email"
              value={
                formData.email
              }
              onChange={
                handleChange
              }
              placeholder="Enter your email"
            />

            <AuthInput
              label="Password"
              type="password"
              name="password"
              value={
                formData.password
              }
              onChange={
                handleChange
              }
              placeholder="Create password"
            />

            <button
              type="submit"
              className="primary-btn"
              style={{
                width: "100%",
                marginTop: "1rem",
              }}
            >
              Register
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
              <Link
                to="/login"
                style={{
                  color:
                    "#7c8cff",
                  fontWeight:
                    "600",
                }}
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;