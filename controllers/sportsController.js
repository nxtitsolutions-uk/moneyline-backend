// controllers/sportsController.js
const Sport = require("../models/sportModel");
const Team = require("../models/teamModel");

// GET /api/sports
exports.listSports = async (req, res) => {
  try {
    const sports = await Sport.find().sort({ name: 1 }).lean();
    res.status(200).json({ sports });
  } catch (err) {
    console.error("List sports error:", err);
    res.status(500).json({ message: "Failed to fetch sports" });
  }
};

// GET /api/sports/:slug/teams  OR /api/teams?sport=slug
exports.listTeamsBySport = async (req, res) => {
  try {
    const sportSlug = req.params.slug || req.query.sport;
    if (!sportSlug) return res.status(400).json({ message: "Sport is required" });

    const sport = await Sport.findOne({ slug: sportSlug.toLowerCase() });
    if (!sport) return res.status(404).json({ message: "Sport not found" });

    // Optional filters: league, country, search
    const { league, country, q } = req.query;
    const filter = { sport: sport._id };
    if (league) filter.league = league;
    if (country) filter.country = country;
    if (q) filter.name = new RegExp(q, "i");

    const teams = await Team.find(filter).sort({ name: 1 }).lean();
    res.status(200).json({ sport: { name: sport.name, slug: sport.slug }, teams });
  } catch (err) {
    console.error("List teams error:", err);
    res.status(500).json({ message: "Failed to fetch teams" });
  }
};
