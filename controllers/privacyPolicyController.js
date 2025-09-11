const PrivacyPolicy = require("../models/privacyPolicyModel");

// GET /privacy-policy
exports.getPrivacyPolicy = async (req, res) => {
  try {
    const privacyPolicy = await PrivacyPolicy.findOne({}).sort({
      createdAt: -1,
    });
    res.status(200).json({
      status: 200,
      success: true,
      message: "Privacy policy fetched successfully.",
      data: { privacyPolicy },
    });
  } catch (error) {
    console.error("Get privacy policy error:", error);
    res.status(500).json({ message: "Server error while fetching policy." });
  }
};

// POST /privacy-policy
exports.createPrivacyPolicy = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Content is required." });
    }

    const privacyPolicy = await PrivacyPolicy.create({
      content,
      user: req.user._id,
    });

    res.status(200).json({
      status: 200,
      success: true,
      message: "Privacy policy created successfully.",
      data: { privacyPolicy },
    });
  } catch (error) {
    console.error("Create privacy policy error:", error);
    res.status(500).json({ message: "Server error during creation." });
  }
};

// PATCH /privacy-policy/:id
exports.updatePrivacyPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await PrivacyPolicy.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Privacy policy not found." });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Privacy policy updated successfully.",
      data: { privacyPolicy: updated },
    });
  } catch (error) {
    console.error("Update privacy policy error:", error);
    res.status(500).json({ message: "Server error during update." });
  }
};

// DELETE /privacy-policy/:id
exports.deletePrivacyPolicy = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPolicy = await PrivacyPolicy.findByIdAndDelete(id);
    if (!deletedPolicy) {
      return res.status(404).json({ message: "Privacy policy not found." });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "Privacy policy deleted successfully.",
      data: { privacyPolicy: deletedPolicy },
    });
  } catch (error) {
    console.error("Delete privacy policy error:", error);
    res.status(500).json({ message: "Server error during deletion." });
  }
};
