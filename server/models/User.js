const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["client", "freelancer"],
      default: "freelancer",
    },

    headline: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    location: {
      type: String,
      default: "",
      trim: true,
    },

    github: {
      type: String,
      default: "",
    },

    linkedin: {
      type: String,
      default: "",
    },

    portfolio: {
      type: String,
      default: "",
    },

    experienceLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Expert"],
      default: "Beginner",
    },

    openToWork: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    xp: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    reputationScore: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    activityLevel: {
      type: String,
      enum: ["Emerging", "Skilled", "Trusted", "Expert", "Leader"],
      default: "Emerging",
    },

    badges: [
      {
        key: {
          type: String,
          required: true,
        },
        label: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          default: "",
        },
        category: {
          type: String,
          enum: ["collaboration", "skill", "community", "challenge", "reputation"],
          default: "reputation",
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // SAVED SKILLS
    savedSkills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
