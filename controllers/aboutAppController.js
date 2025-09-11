const AboutApp = require("../models/aboutAppModel");

//Get latest AboutApp content by language and platform
exports.getAboutApp = async (req, res) => {
  try {
    const language = req.query.language || "en";
    const platform = req.query.platform || "android";

    const content = await AboutApp.findOne({ language, platform }).sort({ createdAt: -1 });

    if (!content) {
      return res.status(404).json({ message: "About App content not found." });
    }

    return res.status(200).json({ content });
  } catch (error) {
    console.error("Get About App Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// Create new AboutApp content
exports.createAboutApp = async (req, res) => {
  try {
    const { content, language = "en", platform = "android" } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required." });
    }

    const entry = await AboutApp.create({ content, language, platform });

    return res.status(201).json({
      message: "About App content created successfully.",
      aboutApp: entry,
    });
  } catch (error) {
    console.error("Create About App Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// Update existing AboutApp content
exports.updateAboutApp = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await AboutApp.findByIdAndUpdate(id, updates, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "About App content not found." });
    }

    return res.status(200).json({
      message: "About App content updated.",
      aboutApp: updated,
    });
  } catch (error) {
    console.error("Update About App Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// Delete AboutApp content
exports.deleteAboutApp = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await AboutApp.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "About App content not found." });
    }

    return res.status(200).json({ message: "About App content deleted." });
  } catch (error) {
    console.error("Delete About App Error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
