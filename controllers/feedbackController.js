const Feedback = require("../models/feedbackModel");
const profileModel = require("../models/profileModel");
exports.submitFeedback = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "message_required" });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      message,
    });

    return res.status(201).json({
      message: "feedback_submitted",
      feedback,
    });
  } catch (error) {
    console.error("Submit Feedback Error:", error);
    return res.status(500).json({ message: "server_error" });
  }
};

exports.getAllFeedbacks = async (req, res) => {
  try {
    // Step 1: Get all feedbacks with user basic info
    const feedbacks = await Feedback.find().populate("user", "_id email");

    // Step 2: For each feedback, find the corresponding profile
    const enrichedFeedbacks = await Promise.all(
      feedbacks.map(async (feedback) => {
        const profile = await profileModel.findOne(
          { user: feedback.user._id },
          "firstName lastName"
        );

        return {
          ...feedback.toObject(),
          user: {
            ...feedback.user.toObject(),
            firstName: profile?.firstName || null,
            lastName: profile?.lastName || null,
          },
        };
      })
    );

    return res.status(200).json({
      message: "feedbacks_fetched",
      feedbacks: enrichedFeedbacks,
    });
  } catch (error) {
    console.error("Get Feedbacks Error:", error);
    return res.status(500).json({ message: "server_error" });
  }
};

exports.resolveFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { isResolved: true },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: "feedback_not_found" });
    }

    return res.status(200).json({
      message: "feedback_marked_resolved",
      feedback,
    });
  } catch (error) {
    console.error("Resolve Feedback Error:", error);
    return res.status(500).json({ message: "server_error" });
  }
};
