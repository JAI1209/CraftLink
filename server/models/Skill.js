const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    tags: [{ type: String }],
    type: { type: String, enum: ["offer","request"], default: "offer" },
    mode: { type: String, enum: ["barter","paid","both"], default: "paid" },
    status: { type: String, enum: ["active","closed"], default: "active" },
    rating: { type: Number, default: 5 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

skillSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Skill", skillSchema);
