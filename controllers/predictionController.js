// controllers/predictionController.js
const dayjs = require("dayjs");
const UserPrediction = require("../models/userPredictionModel");
const { SUPPORTED_SPORTS } = require("../models/adminVoteModel");
const { getMatchResult } = require("../services/matchResultService");

const toStr = (v) => (v === undefined || v === null ? "" : String(v));

/** Create or upsert prediction */
exports.createOrUpsertPrediction = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { sportType, matchId, selectedTeamId, selectedTeamName, timezone } =
      req.body;

    if (!userId)
      return res.status(401).json({ error: "Unauthorized: user missing" });

    if (!sportType || !matchId || !selectedTeamId || !selectedTeamName)
      return res
        .status(400)
        .json({ error: "sportType, matchId, selectedTeamId, selectedTeamName are required" });

    if (!SUPPORTED_SPORTS.includes(sportType))
      return res
        .status(400)
        .json({ error: `Invalid sportType. Supported: ${SUPPORTED_SPORTS.join(", ")}` });

    // Snapshot match info at time of prediction
    let snapshot = undefined;
    let fullMatchJSON = undefined;
    try {
      const result = await getMatchResult({ sportType, matchId, timezone });
      snapshot = {
        leagueName: result.leagueName,
        scheduledAt: result.scheduledAt,
        status: result.status,
        homeTeam: result.home,
        awayTeam: result.away,
      };
      fullMatchJSON = result.fullRaw || result;
    } catch {
      /* ignore */
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
        ...(fullMatchJSON && { matchResult: fullMatchJSON }),
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({ message: "Prediction saved", prediction: doc });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ error: "Prediction already exists for this match" });
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

/** Get prediction for specific match */
// exports.getUserPrediction = async (req, res) => {
//   try {
//     const userId = req.user?._id;
//     const { sportType, matchId } = req.params;
//     if (!userId) return res.status(401).json({ error: "Unauthorized" });

//     const pred = await UserPrediction.findOne({
//       user: userId,
//       sportType,
//       matchId: toStr(matchId),
//     });

//     if (!pred) return res.status(404).json({ error: "Not found" });
//     return res.status(200).json({ prediction: pred });
//   } catch (err) {
//     return res.status(500).json({ error: err.message || "Server error" });
//   }
// };
exports.getUserPrediction = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { sportType, matchId } = req.params;
    const timezone = req.query.timezone;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    let pred = await UserPrediction.findOne({
      user: userId,
      sportType,
      matchId: toStr(matchId),
    });

    if (!pred) return res.status(404).json({ error: "Not found" });

    // ✅ Re-settle before returning (ensures real-time result)
    pred = await settlePredictionIfPossible(pred, timezone);

    return res.status(200).json({ prediction: pred });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

/** Update prediction (if not settled) */
exports.updatePrediction = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { sportType, matchId } = req.params;
    const { selectedTeamId, selectedTeamName } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!selectedTeamId || !selectedTeamName)
      return res
        .status(400)
        .json({ error: "selectedTeamId and selectedTeamName required" });

    const existing = await UserPrediction.findOne({
      user: userId,
      sportType,
      matchId: toStr(matchId),
    });

    if (!existing) return res.status(404).json({ error: "Not found" });
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

/** Delete prediction */
exports.deletePrediction = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { sportType, matchId } = req.params;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const deleted = await UserPrediction.findOneAndDelete({
      user: userId,
      sportType,
      matchId: toStr(matchId),
    });

    if (!deleted) return res.status(404).json({ error: "Not found" });
    return res.status(200).json({ message: "Prediction deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

/** List predictions */
exports.listUserPredictions = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10"), 1), 100);
    const { sportType } = req.query;

    const filter = { user: userId };
    if (sportType) filter.sportType = sportType;

    const [items, total] = await Promise.all([
      UserPrediction.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
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

/** Internal helper: settle predictions using live data */
/** Internal helper: settle predictions using live data */
async function settlePredictionIfPossible(pred, timezone) {
  try {
    const result = await getMatchResult({
      sportType: pred.sportType,
      matchId: pred.matchId,
      timezone,
    });

    // --- Always refresh snapshot for UI ---
    pred.providerSnapshot = {
      leagueName: result.leagueName,
      scheduledAt: result.scheduledAt,
      status: result.status,
      homeTeam: result.home,
      awayTeam: result.away,
    };

    // --- Always keep the latest full JSON ---
    pred.matchResult = result.fullRaw || result;

    // --- Normalize structure (for old or partial data) ---
    const home = result.home || pred.matchResult?.teams?.home || {};
    const away = result.away || pred.matchResult?.teams?.away || {};
    const homeScore =
      home.score ??
      pred.matchResult?.scores?.home?.total ??
      pred.matchResult?.game?.scores?.home?.total ??
      null;
    const awayScore =
      away.score ??
      pred.matchResult?.scores?.away?.total ??
      pred.matchResult?.game?.scores?.away?.total ??
      null;

    // --- Determine match completion & winner ---
    const finished =
      result.finished ||
      result.status?.toUpperCase().includes("FT") ||
      result.status?.toUpperCase().includes("FINISHED");

    let winnerTeamId = result.winnerTeamId || null;
    let winnerTeamName = result.winnerTeamName || null;

    if (!winnerTeamId && homeScore !== null && awayScore !== null) {
      if (homeScore > awayScore) {
        winnerTeamId = home.id;
        winnerTeamName = home.name;
      } else if (awayScore > homeScore) {
        winnerTeamId = away.id;
        winnerTeamName = away.name;
      }
    }

    // --- If the match finished and winner is known, settle prediction ---
    if (finished && winnerTeamId) {
      pred.settledAt = pred.settledAt || new Date();
      pred.outcomeTeamId = winnerTeamId;
      pred.outcomeTeamName = winnerTeamName;
      pred.isCorrect = toStr(pred.selectedTeamId) === toStr(winnerTeamId);
    }

    await pred.save();
    return pred;
  } catch (err) {
    console.error(
      `❌ Error settling prediction for match ${pred.matchId}:`,
      err.message
    );
    return pred;
  }
}


/** Overview (accuracy + card list) */
exports.getOverview = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const windowDays = Math.min(parseInt(req.query.windowDays || "30"), 180);
    const sportType = req.query.sportType;
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10"), 1), 50);
    const timezone = req.query.timezone;

    const now = dayjs();
    const from = now.subtract(windowDays, "day");

    const filter = {
      user: userId,
      createdAt: { $gte: from.toDate(), $lte: now.toDate() },
    };
    if (sportType) filter.sportType = sportType;

    const preds = await UserPrediction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Always refresh data for accuracy
    await Promise.all(preds.map((p) => settlePredictionIfPossible(p, timezone)));

    // Compute accuracy
    const [total, correct] = await Promise.all([
      UserPrediction.countDocuments(filter),
      UserPrediction.countDocuments({ ...filter, isCorrect: true }),
    ]);

    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    const cards = preds.map((p) => {
      const snap = p.providerSnapshot || {};
      const home = snap.homeTeam || {};
      const away = snap.awayTeam || {};
      let resultLabel = "PENDING";
      if (p.settledAt)
        resultLabel = p.isCorrect ? "CORRECT PREDICTION" : "WRONG PREDICTION";

      return {
        sportType: p.sportType,
        league: snap.leagueName || null,
        matchId: p.matchId,
        time: snap.scheduledAt
          ? dayjs(snap.scheduledAt).format("h:mma")
          : null,
        status: snap.status || null,
        homeTeam: home,
        awayTeam: away,
        myPrediction: p.selectedTeamName,
        result: resultLabel,
        matchResult: p.matchResult || {},
      };
    });

    return res.status(200).json({
      accuracy: {
        percent: pct,
        status:
          pct >= 65 ? "Crushing It" : pct >= 50 ? "On Track" : "Keep Going",
        windowDays,
      },
      pagination: { page, limit, count: cards.length },
      predictions: cards,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
};
