const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    mediaUrl: { type: String }, // image/video URL
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
