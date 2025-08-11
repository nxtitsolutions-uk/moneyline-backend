// utils/hash.js
const crypto = require("crypto");
module.exports.hashOf = (obj) =>
  crypto.createHash("sha256").update(JSON.stringify(obj)).digest("hex");
