const mongoose = require("mongoose");

const savedCollabNoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollabNote",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

savedCollabNoteSchema.index({ user: 1, note: 1 }, { unique: true });

module.exports = mongoose.model("SavedCollabNote", savedCollabNoteSchema);
