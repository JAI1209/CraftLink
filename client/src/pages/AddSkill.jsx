import {
  useState,
} from "react";

import axios from "axios";

import toast from "react-hot-toast";

const AddSkill = () => {
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

      const { data } =
        await axios.post(
          "http://localhost:5000/api/skills",
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

      console.log(data);

      setFormData({
        title: "",
        category: "",
        description: "",
        price: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data
          ?.message ||
          "Something went wrong"
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
            padding: "3rem",
          }}
        >
          <h1
            style={{
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            Add New Skill
          </h1>

          <form
            onSubmit={handleSubmit}
          >
            {/* TITLE */}
            <input
              type="text"
              name="title"
              placeholder="Skill title"
              value={formData.title}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* CATEGORY */}
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              style={inputStyle}
            />

            {/* DESCRIPTION */}
            <textarea
              name="description"
              placeholder="Description"
              value={
                formData.description
              }
              onChange={handleChange}
              style={{
                ...inputStyle,
                minHeight: "140px",
                resize: "none",
              }}
            />

            {/* PRICE */}
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              style={inputStyle}
            />

            <button
              type="submit"
              className="primary-btn"
              style={{
                width: "100%",
              }}
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
  borderRadius: "14px",
  border:
    "1px solid rgba(255,255,255,0.08)",
  background:
    "rgba(255,255,255,0.03)",
  color: "white",
  marginBottom: "1.5rem",
};

export default AddSkill;