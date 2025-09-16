const Comment = require("../models/commentModel");
const Profile = require("../models/profileModel");

exports.createComment = async (req, res) => {
  try {
    const { postId, text } = req.body;

    const comment = await Comment.create({
      text,
      post: postId,
      user: req.user._id,
    });

    await comment.populate("user", "name profilePicture")

    res.status(201).json({ status: "success", comment });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Failed to create comment" });
  }
};

exports.getAllComments = async (req, res) => {
  try {
    const postId = req.params.postId;

    const comments = await Comment.find({ post: postId })
      .populate("user", "name profilePicture")
      .lean();

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const { text } = req.body;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.text = text;
    await comment.save();

    res.status(200).json({ status: "success", comment });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Failed to update comment" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await comment.remove();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};
