const mongoose = require("mongoose");

const collabNoteCommentSchema = new mongoose.Schema(
  {
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollabNote",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollabNoteComment",
      default: null,
      index: true,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        type: {
          type: String,
          enum: ["like", "insightful", "helpful"],
          default: "like",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

collabNoteCommentSchema.index({ note: 1, createdAt: -1 });
collabNoteCommentSchema.index({ parent: 1, createdAt: 1 });

module.exports = mongoose.model("CollabNoteComment", collabNoteCommentSchema);
