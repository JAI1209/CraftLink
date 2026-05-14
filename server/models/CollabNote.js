const mongoose = require("mongoose");

const collaboratorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["viewer", "commenter", "editor"],
      default: "viewer",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const collabNoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    content: {
      type: String,
      default: "",
      maxlength: 150000,
    },
    excerpt: {
      type: String,
      default: "",
      trim: true,
      maxlength: 260,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    visibility: {
      type: String,
      enum: ["private", "shared", "public"],
      default: "private",
      index: true,
    },
    category: {
      type: String,
      enum: ["research", "project", "code", "prompt", "planning", "documentation", "general"],
      default: "general",
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 32,
      },
    ],
    collaborators: [collaboratorSchema],
    pinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    archived: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lastEditedAt: {
      type: Date,
      default: Date.now,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    savesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    participationRequestsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentVersion: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { timestamps: true }
);

collabNoteSchema.index({ title: "text", content: "text", tags: "text" });
collabNoteSchema.index({ owner: 1, pinned: -1, updatedAt: -1 });
collabNoteSchema.index({ "collaborators.user": 1, updatedAt: -1 });
collabNoteSchema.index({ visibility: 1, category: 1, updatedAt: -1 });

module.exports = mongoose.model("CollabNote", collabNoteSchema);
