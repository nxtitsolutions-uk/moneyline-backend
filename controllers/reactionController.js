const Reaction = require("../models/reactionModel");

exports.createReaction = async (req, res) => {
  try {
    const { postId, commentId, type } = req.body;

    const reaction = new Reaction({
      type,
      post: postId,
      comment: commentId,
      user: req.user._id,
    });

    await reaction.save();

    await reaction.populate("user", "name profilePicture");

    res.status(201).json({ status: "success", reaction });
  } catch (error) {
    console.error("Error creating reaction:", error);
    res.status(500).json({ message: "Failed to create reaction" });
  }
};
