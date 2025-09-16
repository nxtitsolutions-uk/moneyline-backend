const Report = require("../models/reportModel");

exports.createReport = async (req, res) => {
  try {
    const { reason, postId } = req.body;

    const report = new Report({
      reason,
      post: postId,
      user: req.user._id,
    });

    await report.save();

    res.status(201).json({ status: "success", message: "Post reported" });
  } catch (error) {
    console.error("Error reporting post:", error);
    res.status(500).json({ message: "Failed to report post" });
  }
};
