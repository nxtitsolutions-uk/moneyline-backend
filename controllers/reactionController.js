const Reaction = require("../models/reactionModel");

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

    await reaction.populate("user", "name profilePicture");

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
      .populate("user", "name profilePicture")
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
      .populate("user", "name profilePicture")
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
 * Update a reaction
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

    await reaction.populate("user", "name profilePicture");

    res.status(200).json({ status: "success", reaction });
  } catch (error) {
    console.error("❌ Error updating reaction:", error);
    res.status(500).json({ message: "Failed to update reaction" });
  }
};

/**
 * Delete a reaction
 */
exports.deleteReaction = async (req, res) => {
  try {
    const reactionId = req.params.id;

    const reaction = await Reaction.findById(reactionId);

    if (!reaction) {
      return res.status(404).json({ message: "Reaction not found" });
    }

    if (reaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await reaction.remove();

    res.status(200).json({ message: "Reaction deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting reaction:", error);
    res.status(500).json({ message: "Failed to delete reaction" });
  }
};
