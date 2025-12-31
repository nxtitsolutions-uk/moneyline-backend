const express = require("express");
const { getDashboardOverview } = require("../controllers/analyticsController");

const router = express.Router();

router.get("/overview", getDashboardOverview);

module.exports = router;
