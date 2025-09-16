const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reason: { type: String, required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
