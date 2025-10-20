// controllers/adminVoteController.js
const { AdminVote, SUPPORTED_SPORTS } = require("../models/adminVoteModel");

/**
 * Helper: normalize IDs to string (works with numeric or string inputs)
 */
const toStr = (v) => (v === undefined || v === null ? "" : String(v));

/**
 * POST /admin/vote
 * Create or upsert a vote (global per sportType+matchId).
 */
exports.createOrUpsertVote = async (req, res) => {
  try {
    const { sportType, matchId, selectedTeamId, selectedTeamName } = req.body;
    const adminId = req.user?._id;

    if (!sportType || !matchId || !selectedTeamId || !selectedTeamName) {
      return res.status(400).json({
        error: "sportType, matchId, selectedTeamId, and selectedTeamName are required",
      });
    }

    if (!SUPPORTED_SPORTS.includes(sportType)) {
      return res.status(400).json({
        error: `Invalid sportType. Supported: ${SUPPORTED_SPORTS.join(", ")}`,
      });
    }

    const vote = await AdminVote.findOneAndUpdate(
      { sportType, matchId: toStr(matchId) },
      {
        sportType,
        matchId: toStr(matchId),
        selectedTeamId: toStr(selectedTeamId),
        selectedTeamName,
        votedBy: adminId,
        votedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({ message: "Vote recorded", vote });
  } catch (err) {
    // Handle unique index race condition gracefully
    if (err.code === 11000) {
      return res.status(409).json({ error: "Vote already exists for this match" });
    }
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

/**
 * GET /admin/vote/:sportType/:matchId
 * Read vote for a specific (sportType, matchId).
 */
exports.getVote = async (req, res) => {
  try {
    const { sportType, matchId } = req.params;

    if (!sportType || !matchId) {
      return res.status(400).json({ error: "sportType and matchId are required" });
    }

    if (!SUPPORTED_SPORTS.includes(sportType)) {
      return res.status(400).json({
        error: `Invalid sportType. Supported: ${SUPPORTED_SPORTS.join(", ")}`,
      });
    }

    const vote = await AdminVote.findOne({ sportType, matchId: toStr(matchId) });
    if (!vote) return res.status(404).json({ error: "No vote found for this match" });

    return res.status(200).json({ vote });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

/**
 * PUT /admin/vote/:sportType/:matchId
 * Update an existing vote for (sportType, matchId).
 */
exports.updateVote = async (req, res) => {
  try {
    const { sportType, matchId } = req.params;
    const { selectedTeamId, selectedTeamName } = req.body;
    const adminId = req.user?._id;

    if (!sportType || !matchId) {
      return res.status(400).json({ error: "sportType and matchId are required" });
    }
    if (!selectedTeamId || !selectedTeamName) {
      return res.status(400).json({
        error: "selectedTeamId and selectedTeamName are required",
      });
    }
    if (!SUPPORTED_SPORTS.includes(sportType)) {
      return res.status(400).json({
        error: `Invalid sportType. Supported: ${SUPPORTED_SPORTS.join(", ")}`,
      });
    }

    const vote = await AdminVote.findOneAndUpdate(
      { sportType, matchId: toStr(matchId) },
      {
        selectedTeamId: toStr(selectedTeamId),
        selectedTeamName,
        votedBy: adminId,
        votedAt: new Date(),
      },
      { new: true }
    );

    if (!vote) return res.status(404).json({ error: "No vote found to update" });

    return res.status(200).json({ message: "Vote updated", vote });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

/**
 * DELETE /admin/vote/:sportType/:matchId
 * Remove a vote for (sportType, matchId).
 */
exports.deleteVote = async (req, res) => {
  try {
    const { sportType, matchId } = req.params;

    if (!sportType || !matchId) {
      return res.status(400).json({ error: "sportType and matchId are required" });
    }
    if (!SUPPORTED_SPORTS.includes(sportType)) {
      return res.status(400).json({
        error: `Invalid sportType. Supported: ${SUPPORTED_SPORTS.join(", ")}`,
      });
    }

    const result = await AdminVote.findOneAndDelete({
      sportType,
      matchId: toStr(matchId),
    });

    if (!result) return res.status(404).json({ error: "No vote found to delete" });

    return res.status(200).json({ message: "Vote deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

/**
 * GET /admin/votes
 * List votes with pagination and filters.
 * Query: page, limit, sportType?, matchId?, teamId?
 */
exports.listVotes = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100);

    const { sportType, matchId, teamId } = req.query;
    const filter = {};

    if (sportType) {
      if (!SUPPORTED_SPORTS.includes(sportType)) {
        return res.status(400).json({
          error: `Invalid sportType. Supported: ${SUPPORTED_SPORTS.join(", ")}`,
        });
      }
      filter.sportType = sportType;
    }
    if (matchId) filter.matchId = toStr(matchId);
    if (teamId) filter.selectedTeamId = toStr(teamId);

    const [items, total] = await Promise.all([
      AdminVote.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      AdminVote.countDocuments(filter),
    ]);

    return res.status(200).json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
};
