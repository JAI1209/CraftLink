import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import API from "../services/api";

const EditSkill = () => {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const [formData, setFormData] =
    useState({
      title: "",
      category: "",
      description: "",
      price: "",
    });

  const {
    title,
    category,
    description,
    price,
  } = formData;

  // FETCH SKILL
  useEffect(() => {
    const fetchSkill =
      async () => {
        try {
          const { data } =
            await API.get(
              "/skills"
            );

          const skill =
            data.find(
              (item) =>
                item._id === id
            );

          if (skill) {
            setFormData({
              title:
                skill.title,
              category:
                skill.category,
              description:
                skill.description,
              price:
                skill.price,
            });
          }
        } catch (error) {
          console.log(error);
        }
      };

    fetchSkill();
  }, [id]);

  // HANDLE CHANGE
  const handleChange = (
    e
  ) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  // SUBMIT
  const handleSubmit =
    async (e) => {
      e.preventDefault();

      try {
        const token =
          localStorage.getItem(
            "token"
          );

        await API.put(
          `/skills/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success(
          "Skill updated 🚀"
        );

        navigate(
          "/dashboard"
        );
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "Update failed"
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
            Edit Skill ✏️
          </h1>

          <form
            onSubmit={
              handleSubmit
            }
          >
            <input
              type="text"
              name="title"
              placeholder="Skill title"
              value={title}
              onChange={
                handleChange
              }
              required
            />

            <input
              type="text"
              name="category"
              placeholder="Category"
              value={category}
              onChange={
                handleChange
              }
              required
            />

            <textarea
              name="description"
              placeholder="Description"
              value={
                description
              }
              onChange={
                handleChange
              }
              required
            />

            <input
              type="number"
              name="price"
              placeholder="Price"
              value={price}
              onChange={
                handleChange
              }
              required
            />

            <button
              className="primary-btn"
              style={{
                width: "100%",
                marginTop: "1rem",
              }}
            >
              Update Skill
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default EditSkill;