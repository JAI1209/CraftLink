const mongoose = require("mongoose");

const skillSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
      },

      category: {
        type: String,
        required: true,
      },

      description: {
        type: String,
        required: true,
      },

      price: {
        type: Number,
        required: true,
      },

      rating: {
        type: Number,
        default: 5,
      },

      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "Skill",
  skillSchema
);