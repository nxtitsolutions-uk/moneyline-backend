const mongoose = require("mongoose");

const aboutAppSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true
    },
    language: {
      type: String,
      enum: ["en", "ur"],
      default: "en"
    },
    platform: {
      type: String,
      enum: ["android", "ios", "web"],
      default: "android"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutApp", aboutAppSchema);
