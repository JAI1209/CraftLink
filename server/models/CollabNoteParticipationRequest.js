const mongoose = require("mongoose");

const collabNoteParticipationRequestSchema = new mongoose.Schema(
  {
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollabNote",
      required: true,
      index: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    requestedRole: {
      type: String,
      enum: ["viewer", "commenter", "editor"],
      default: "editor",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    decidedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

collabNoteParticipationRequestSchema.index(
  { note: 1, requester: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

module.exports = mongoose.model(
  "CollabNoteParticipationRequest",
  collabNoteParticipationRequestSchema
);
