const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    badges: [
      {
        type: String,
        trim: true,
        maxlength: 48,
      },
    ],
  },
  { _id: false }
);

const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["joined", "submitted", "shortlisted", "winner"],
      default: "joined",
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1200,
      default: "",
    },
    links: [
      {
        type: String,
        trim: true,
        maxlength: 300,
      },
    ],
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const communityChallengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    type: {
      type: String,
      enum: [
        "UI/UX challenge",
        "frontend coding sprint",
        "backend/API challenge",
        "AI prompt competition",
        "research/problem-solving event",
        "collaboration hackathon",
        "weekly challenge",
        "monthly challenge",
      ],
      required: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 800,
    },
    brief: {
      type: String,
      default: "",
      maxlength: 3000,
    },
    status: {
      type: String,
      enum: ["draft", "active", "upcoming", "completed"],
      default: "upcoming",
      index: true,
    },
    startsAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    endsAt: {
      type: Date,
      required: true,
      index: true,
    },
    skills: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 48,
      },
    ],
    rewards: {
      type: rewardSchema,
      default: () => ({}),
    },
    participants: [participantSchema],
    submissions: [submissionSchema],
    winnerShowcase: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        title: {
          type: String,
          trim: true,
          maxlength: 140,
        },
        score: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

communityChallengeSchema.index({ status: 1, startsAt: 1, endsAt: 1 });
communityChallengeSchema.index({ "participants.user": 1, status: 1 });

module.exports = mongoose.model("CommunityChallenge", communityChallengeSchema);
