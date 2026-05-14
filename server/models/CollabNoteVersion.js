const mongoose = require("mongoose");

const collabNoteVersionSchema = new mongoose.Schema(
  {
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollabNote",
      required: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changeSummary: {
      type: String,
      default: "",
      trim: true,
      maxlength: 240,
    },
  },
  { timestamps: true }
);

collabNoteVersionSchema.index({ note: 1, version: -1 }, { unique: true });

module.exports = mongoose.model("CollabNoteVersion", collabNoteVersionSchema);
