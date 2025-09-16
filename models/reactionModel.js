const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["like", "dislike"], required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reaction", reactionSchema);
