import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import API from "../services/api";

const AddSkill = () => {
  const navigate =
    useNavigate();

  const [formData, setFormData] =
    useState({
      title: "",
      category: "",
      description: "",
      price: "",
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
      const token =
        localStorage.getItem(
          "token"
        );

      await API.post(
        "/skills",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        "Skill added successfully 🚀"
      );

      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data
          ?.message ||
          "Failed to add skill"
      );
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div
          className="glass"
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            padding: "2rem",
          }}
        >
          <h1
            style={{
              marginBottom: "2rem",
            }}
          >
            Add New Skill
          </h1>

          <form
            onSubmit={
              handleSubmit
            }
          >
            {/* TITLE */}
            <input
              type="text"
              name="title"
              placeholder="Skill title"
              value={
                formData.title
              }
              onChange={
                handleChange
              }
              style={inputStyle}
            />

            {/* CATEGORY */}
            <select
              name="category"
              value={
                formData.category
              }
              onChange={
                handleChange
              }
              style={inputStyle}
            >
              <option value="">
                Select Category
              </option>

              <option value="Development">
                Development
              </option>

              <option value="Design">
                Design
              </option>

              <option value="Marketing">
                Marketing
              </option>

              <option value="Editing">
                Editing
              </option>
            </select>

            {/* DESCRIPTION */}
            <textarea
              name="description"
              placeholder="Skill description"
              value={
                formData.description
              }
              onChange={
                handleChange
              }
              rows="5"
              style={inputStyle}
            />

            {/* PRICE */}
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={
                formData.price
              }
              onChange={
                handleChange
              }
              style={inputStyle}
            />

            <button
              type="submit"
              className="primary-btn"
            >
              Add Skill
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

const inputStyle = {
  width: "100%",
  padding: "1rem",
  marginBottom: "1rem",
  borderRadius: "14px",
  border:
    "1px solid rgba(255,255,255,0.08)",
  background:
    "rgba(255,255,255,0.03)",
  color: "white",
  outline: "none",
};

export default AddSkill;