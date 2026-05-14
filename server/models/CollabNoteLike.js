const mongoose = require("mongoose");

const collabNoteLikeSchema = new mongoose.Schema(
  {
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollabNote",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

collabNoteLikeSchema.index({ note: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("CollabNoteLike", collabNoteLikeSchema);
