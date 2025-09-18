const Reaction = require("../models/reactionModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");

/**
 * Create a new reaction
 */
exports.createReaction = async (req, res) => {
  try {
    const { postId, commentId, type } = req.body;

    const reaction = new Reaction({
      type,
      post: postId || null,
      comment: commentId || null,
      user: req.user._id,
    });

    await reaction.save();

    await reaction.populate({
      path: "user",
      select: "email role",
      populate: {
        path: "profile",
        select: "name profilePicture username",
      },
    });

    res.status(201).json({ status: "success", reaction });
  } catch (error) {
    console.error("❌ Error creating reaction:", error);
    res.status(500).json({ message: "Failed to create reaction" });
  }
};

/**
 * Get all reactions (optional: filter by post or comment via query params)
 */
exports.getAllReactions = async (req, res) => {
  try {
    const { postId, commentId } = req.query;

    const filter = {};
    if (postId) filter.post = postId;
    if (commentId) filter.comment = commentId;

    const reactions = await Reaction.find(filter)
      .populate({
        path: "user",
        select: "email role",
        populate: {
          path: "profile",
          select: "name profilePicture username",
        },
      })
      .lean();

    res.status(200).json({ status: "success", count: reactions.length, reactions });
  } catch (error) {
    console.error("❌ Error fetching reactions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get a reaction by ID
 */
exports.getReactionById = async (req, res) => {
  try {
    const reactionId = req.params.id;

    const reaction = await Reaction.findById(reactionId)
      .populate({
        path: "user",
        select: "email role",
        populate: {
          path: "profile",
          select: "name profilePicture username",
        },
      })
      .lean();

    if (!reaction) {
      return res.status(404).json({ message: "Reaction not found" });
    }

    res.status(200).json({ status: "success", reaction });
  } catch (error) {
    console.error("❌ Error fetching reaction:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update a reaction (only reaction owner can update)
 */
exports.updateReaction = async (req, res) => {
  try {
    const reactionId = req.params.id;
    const { type } = req.body;

    const reaction = await Reaction.findById(reactionId);

    if (!reaction) {
      return res.status(404).json({ message: "Reaction not found" });
    }

    if (reaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    reaction.type = type || reaction.type;
    await reaction.save();

    await reaction.populate({
      path: "user",
      select: "email role",
      populate: {
        path: "profile",
        select: "name profilePicture username",
      },
    });

    res.status(200).json({ status: "success", reaction });
  } catch (error) {
    console.error("❌ Error updating reaction:", error);
    res.status(500).json({ message: "Failed to update reaction" });
  }
};

/**
 * Delete a reaction
 * Allowed: reaction owner, post owner, or comment owner
 */
exports.deleteReaction = async (req, res) => {
  try {
    const reactionId = req.params.id;
    const reaction = await Reaction.findById(reactionId).lean();

    if (!reaction) {
      return res.status(404).json({ message: "Reaction not found" });
    }

    let postOwnerId = null;
    let commentOwnerId = null;

    // If linked to a post, fetch post owner
    if (reaction.post) {
      const post = await Post.findById(reaction.post).lean();
      if (post) postOwnerId = post.user.toString();
    }

    // If linked to a comment, fetch comment owner and also post owner
    if (reaction.comment) {
      const comment = await Comment.findById(reaction.comment).lean();
      if (comment) {
        commentOwnerId = comment.user.toString();
        const post = await Post.findById(comment.post).lean();
        if (post) postOwnerId = post.user.toString();
      }
    }

    const isReactionOwner = reaction.user.toString() === req.user._id.toString();
    const isPostOwner = postOwnerId && postOwnerId === req.user._id.toString();
    const isCommentOwner = commentOwnerId && commentOwnerId === req.user._id.toString();

    if (!isReactionOwner && !isPostOwner && !isCommentOwner) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Reaction.findByIdAndDelete(reactionId);

    res.status(200).json({ message: "Reaction deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting reaction:", error);
    res.status(500).json({ message: "Failed to delete reaction" });
  }
};
