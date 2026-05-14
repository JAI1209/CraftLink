const mongoose = require("mongoose");

const contributorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "Contributor",
    },
    status: {
      type: String,
      enum: ["requested", "approved", "rejected", "active"],
      default: "requested",
      index: true,
    },
    portfolioUrl: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    fullName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    username: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    skills: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 48,
      },
    ],
    experienceLevel: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    experience: {
      type: String,
      trim: true,
      maxlength: 700,
      default: "",
    },
    previousWork: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    availability: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    contribution: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    motivation: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    socialLinks: [
      {
        type: String,
        trim: true,
        maxlength: 300,
      },
    ],
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    decidedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

const roadmapItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    status: {
      type: String,
      enum: ["planned", "in-progress", "completed"],
      default: "planned",
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const crowdfundingProjectSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 700,
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: 180,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 60,
      default: "community",
      index: true,
    },
    fundingGoal: {
      type: Number,
      required: true,
      min: 1,
    },
    fundingRaised: {
      type: Number,
      default: 0,
      min: 0,
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      default: "Intermediate",
    },
    deadline: {
      type: Date,
      default: null,
      index: true,
    },
    bannerImage: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    projectLinks: [
      {
        type: String,
        trim: true,
        maxlength: 300,
      },
    ],
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
      index: true,
    },
    collaborationRoles: [
      {
        type: String,
        trim: true,
        maxlength: 80,
      },
    ],
    requiredSkills: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 48,
      },
    ],
    requiredCollaborators: {
      type: Number,
      default: 1,
      min: 1,
      max: 50,
    },
    status: {
      type: String,
      enum: ["draft", "active", "featured", "funded", "paused", "completed"],
      default: "active",
      index: true,
    },
    roadmap: [roadmapItemSchema],
    contributors: [contributorSchema],
  },
  { timestamps: true }
);

crowdfundingProjectSchema.index({ status: 1, updatedAt: -1 });
crowdfundingProjectSchema.index({ requiredSkills: 1, status: 1 });
crowdfundingProjectSchema.index({ title: "text", summary: "text", requiredSkills: "text" });

module.exports = mongoose.model("CrowdfundingProject", crowdfundingProjectSchema);
