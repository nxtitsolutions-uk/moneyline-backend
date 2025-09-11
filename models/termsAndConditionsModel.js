const mongoose = require("mongoose");

const termsAndConditionsSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: ["en", "es", "fr", "ur"],
      default: "en",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TermsAndConditions", termsAndConditionsSchema);
