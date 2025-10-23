// controllers/predictionController.js
const dayjs = require("dayjs");
const UserPrediction = require("../models/userPredictionModel");
const { SUPPORTED_SPORTS } = require("../models/adminVoteModel");
const { getMatchResult } = require("../services/matchResultService");

const toStr = (v) => (v === undefined || v === null ? "" : String(v));

/** Create or upsert a user's prediction */
exports.createOrUpsertPrediction = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { sportType, matchId, selectedTeamId, selectedTeamName, timezone } =
      req.body;

    if (!userId)
      return res.status(401).json({ error: "Unauthorized: user missing" });

    if (!sportType || !matchId || !selectedTeamId || !selectedTeamName)
      return res.status(400).json({
        error: "sportType, matchId, selectedTeamId, selectedTeamName are required",
      });

    if (!SUPPORTED_SPORTS.includes(sportType))
      return res.status(400).json({
        error: `Invalid sportType. Supported: ${SUPPORTED_SPORTS.join(", ")}`,
      });

    // Optional: snapshot basic match info at prediction time (best-effort)
    let snapshot = undefined;
    try {
      const resu = await getMatchResult({
        sportType,
        matchId: toStr(matchId),
        timezone,
      });
      snapshot = {
        leagueName: resu.leagueName,
        scheduledAt: resu.scheduledAt,
        status: resu.status,
        homeTeam: resu.home,
        awayTeam: resu.away,
      };
    } catch {
      /* ignore snapshot errors */
    }

    const doc = await UserPrediction.findOneAndUpdate(
      { user: userId, sportType, matchId: toStr(matchId) },
      {
        user: userId,
        sportType,
        matchId: toStr(matchId),
        selectedTeamId: toStr(selectedTeamId),
        selectedTeamName,
        predictedAt: new Date(),
        ...(snapshot && { providerSnapshot: snapshot }),
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({ message: "Prediction saved", prediction: doc });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "Prediction already exists for this match" });
    }
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

/** Get user's prediction for a specific match */
exports.getUserPrediction = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { sportType, matchId } = req.params;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const pred = await UserPrediction.findOne({
      user: userId,
      sportType,
      matchId: toStr(matchId),
    });

    if (!pred) return res.status(404).json({ error: "Not found" });

    return res.status(200).json({ prediction: pred });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

/** Update user's prediction (allowed until locked) */
exports.updatePrediction = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { sportType, matchId } = req.params;
    const { selectedTeamId, selectedTeamName } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!selectedTeamId || !selectedTeamName)
      return res
        .status(400)
        .json({ error: "selectedTeamId and selectedTeamName are required" });

    const existing = await UserPrediction.findOne({
      user: userId,
      sportType,
      matchId: toStr(matchId),
    });

    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.lockedAt)
      return res.status(403).json({ error: "Prediction is locked" });
    if (existing.settledAt)
      return res.status(403).json({ error: "Prediction already settled" });

    existing.selectedTeamId = toStr(selectedTeamId);
    existing.selectedTeamName = selectedTeamName;
    await existing.save();

    return res.status(200).json({ message: "Prediction updated", prediction: existing });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

/** Delete user's prediction */
exports.deletePrediction = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { sportType, matchId } = req.params;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const result = await UserPrediction.findOneAndDelete({
      user: userId,
      sportType,
      matchId: toStr(matchId),
    });

    if (!result) return res.status(404).json({ error: "Not found" });

    return res.status(200).json({ message: "Prediction deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

/** List user's predictions (raw) with pagination & filters */
exports.listUserPredictions = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100);
    const { sportType, settled } = req.query;

    const filter = { user: userId };
    if (sportType) filter.sportType = sportType;
    if (settled === "true") filter.settledAt = { $ne: null };
    if (settled === "false") filter.settledAt = null;

    const [items, total] = await Promise.all([
      UserPrediction.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      UserPrediction.countDocuments(filter),
    ]);

    return res.status(200).json({
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

/** Internal: best-effort settle a prediction by reading provider result */
async function settlePredictionIfPossible(pred, timezone) {
  if (pred.settledAt) return pred; // already settled

  const result = await getMatchResult({
    sportType: pred.sportType,
    matchId: pred.matchId,
    timezone,
  });

  if (!result.finished || !result.winnerTeamId) {
    // update snapshot for UI freshness even if not finished
    pred.providerSnapshot = {
      leagueName: result.leagueName,
      scheduledAt: result.scheduledAt,
      status: result.status,
      homeTeam: result.home,
      awayTeam: result.away,
    };
    return pred;
  }

  pred.settledAt = new Date();
  pred.outcomeTeamId = toStr(result.winnerTeamId);
  pred.outcomeTeamName = result.winnerTeamName;
  pred.isCorrect = toStr(result.winnerTeamId) === toStr(pred.selectedTeamId);

  pred.providerSnapshot = {
    leagueName: result.leagueName,
    scheduledAt: result.scheduledAt,
    status: result.status,
    homeTeam: result.home,
    awayTeam: result.away,
  };

  await pred.save();
  return pred;
}

/** Overview: accuracy + Figma-style cards */
exports.getOverview = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Query params
    const windowDays = Math.min(parseInt(req.query.windowDays || "30", 10), 180); // default 30d
    const compare = req.query.compare !== "false"; // default true
    const sportType = req.query.sportType; // optional
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
    const timezone = req.query.timezone;

    const now = dayjs();
    const from = now.subtract(windowDays, "day");

    const filter = {
      user: userId,
      createdAt: { $gte: from.toDate(), $lte: now.toDate() },
    };
    if (sportType) filter.sportType = sportType;

    // Fetch recent predictions for the window (for cards)
    const preds = await UserPrediction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Try settle those that are not settled yet (non-breaking: read-only to live API)
    await Promise.all(preds.map((p) => settlePredictionIfPossible(p, timezone)));

    // Accuracy for current window
    const [totalNow, correctNow] = await Promise.all([
      UserPrediction.countDocuments(filter),
      UserPrediction.countDocuments({ ...filter, isCorrect: true, settledAt: { $ne: null } }),
    ]);
    const pct = totalNow > 0 ? Math.round((correctNow / totalNow) * 100) : 0;

    // Compare vs previous window
    let changeStr = "0%";
    if (compare) {
      const prevEnd = from;
      const prevStart = prevEnd.subtract(windowDays, "day");
      const prevFilter = {
        user: userId,
        createdAt: { $gte: prevStart.toDate(), $lte: prevEnd.toDate() },
      };
      if (sportType) prevFilter.sportType = sportType;

      const [totalPrev, correctPrev] = await Promise.all([
        UserPrediction.countDocuments(prevFilter),
        UserPrediction.countDocuments({
          ...prevFilter,
          isCorrect: true,
          settledAt: { $ne: null },
        }),
      ]);
      const prevPct = totalPrev > 0 ? (correctPrev / totalPrev) * 100 : 0;
      const delta = pct - Math.round(prevPct);
      changeStr = (delta >= 0 ? "+" : "") + delta.toFixed(1) + "%";
    }

    // Build cards for UI
    const cards = preds.map((p) => {
      const snap = p.providerSnapshot || {};
      const home = snap.homeTeam || {};
      const away = snap.awayTeam || {};

      let resultLabel = "PENDING";
      if (p.settledAt) resultLabel = p.isCorrect ? "CORRECT PREDICTION" : "WRONG PREDICTION";

      return {
        sportType: p.sportType,
        league: snap.leagueName || null,
        matchId: p.matchId,
        time: snap.scheduledAt ? dayjs(snap.scheduledAt).format("h:mma") : null,
        status: snap.status || null,
        homeTeam: {
          id: home.id,
          name: home.name,
          logo: home.logo,
          score: typeof home.score === "number" ? home.score : null,
        },
        awayTeam: {
          id: away.id,
          name: away.name,
          logo: away.logo,
          score: typeof away.score === "number" ? away.score : null,
        },
        myPrediction: p.selectedTeamName,
        result: resultLabel,
      };
    });

    return res.status(200).json({
      accuracy: {
        percent: pct,
        change: changeStr,
        status: pct >= 65 ? "Crushing It" : pct >= 50 ? "On Track" : "Keep Going",
        windowDays,
      },
      pagination: { page, limit, count: cards.length },
      predictions: cards,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
};
