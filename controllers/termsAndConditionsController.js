const TermsAndConditions = require("../models/termsAndConditionsModel");

// GET /terms-and-conditions
exports.getLatestTermsAndConditions = async (req, res) => {
  try {
    const language = req.language || "en";

    const latest = await TermsAndConditions.findOne({ language }).sort({
      createdAt: -1,
    });

    if (!latest) {
      return res.status(404).json({ message: "no_terms_found" });
    }

    return res.status(200).json({
      message: "terms_fetched",
      terms: latest,
    });
  } catch (err) {
    console.error("Error fetching terms:", err);
    return res.status(500).json({ message: "failed_to_fetch_terms" });
  }
};

// POST /terms-and-conditions
exports.createTermsAndConditions = async (req, res) => {
  try {
    const { content } = req.body;
    const language = req.language || "en";

    if (!content) {
      return res.status(400).json({ message: "content_required" });
    }

    // Find latest version for that language
    const latestTerm = await TermsAndConditions.findOne({ language }).sort({
      createdAt: -1,
    });

    let newVersion = "1.0"; // default if none exists

    if (latestTerm?.version) {
      const [major, minor] = latestTerm.version.split(".").map(Number);

      if (minor < 9) {
        newVersion = `${major}.${minor + 1}`;
      } else {
        newVersion = `${major + 1}.0`;
      }
    }
    const terms = await TermsAndConditions.create({
      version: newVersion,
      content,
      language,
    });

    return res.status(201).json({
      message: "terms_created",
      terms,
    });
  } catch (err) {
    console.error("Error creating terms:", err);
    return res.status(500).json({ message: "failed_to_create_terms" });
  }
};
