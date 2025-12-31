const dayjs = require("dayjs");
const User = require("../models/userModel");
const UserPrediction = require("../models/userPredictionModel");
const UserSubscription = require("../models/userSubscriptionModel");
const Subscription = require("../models/subscriptionModel");

const percentChange = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
};

const parsePrice = (price) => {
  if (!price) return 0;
  const numeric = parseFloat(String(price).replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};

const formatHour = (hour) => {
  if (hour === null || hour === undefined) return null;
  return dayjs().hour(hour).minute(0).format("h A");
};

const buildPeakAgg = (from, to) => {
  const createdAt = to ? { $gte: from, $lt: to } : { $gte: from };
  return [
    { $match: { createdAt } },
    { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ];
};

const getAnalyticsSummary = async (_req, res) => {
  try {
  const now = dayjs();
  const startToday = now.startOf("day").toDate();
  const startYesterday = now.subtract(1, "day").startOf("day").toDate();
  const endYesterday = now.subtract(1, "day").endOf("day").toDate();
  const sevenDaysAgo = now.subtract(7, "day").toDate();
  const thirtyDaysAgo = now.subtract(30, "day").toDate();
  const sixtyDaysAgo = now.subtract(60, "day").toDate();

  const [
    totalVotesToday,
    totalVotesYesterday,
    todayParticipants,
    yesterdayParticipants,
    totalUsers,
    peakTodayAgg,
    peakYesterdayAgg,
  ] = await Promise.all([
    UserPrediction.countDocuments({ createdAt: { $gte: startToday } }),
    UserPrediction.countDocuments({
      createdAt: { $gte: startYesterday, $lt: startToday },
    }),
    UserPrediction.distinct("user", { createdAt: { $gte: startToday } }),
    UserPrediction.distinct("user", {
      createdAt: { $gte: startYesterday, $lt: startToday },
    }),
    User.countDocuments({ isDeleted: false }),
    UserPrediction.aggregate(buildPeakAgg(startToday)),
    UserPrediction.aggregate(buildPeakAgg(startYesterday, startToday)),
  ]);

  const participationRateToday =
    totalUsers === 0 ? 0 : (todayParticipants.length / totalUsers) * 100;
  const participationRateYesterday =
    totalUsers === 0 ? 0 : (yesterdayParticipants.length / totalUsers) * 100;

  const avgVotesPerUserToday =
    todayParticipants.length === 0
      ? 0
      : totalVotesToday / todayParticipants.length;
  const avgVotesPerUserYesterday =
    yesterdayParticipants.length === 0
      ? 0
      : totalVotesYesterday / yesterdayParticipants.length;

  const peakHourToday = peakTodayAgg[0]?._id ?? null;
  const peakHourYesterday = peakYesterdayAgg[0]?._id ?? null;

  const topGamesAgg = await UserPrediction.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: { matchId: "$matchId", sportType: "$sportType" },
        totalVotes: { $sum: 1 },
        latestSnapshot: { $first: "$providerSnapshot" },
      },
    },
    { $sort: { totalVotes: -1 } },
    { $limit: 5 },
  ]);

  const totalVotesWindow = topGamesAgg.reduce(
    (acc, item) => acc + item.totalVotes,
    0
  );

  const topGames = topGamesAgg.map((item) => {
    const snapshot = item.latestSnapshot || {};
    const home =
      snapshot.homeTeam?.name ||
      snapshot.homeTeam?.team_name ||
      snapshot.homeTeam?.full_name;
    const away =
      snapshot.awayTeam?.name ||
      snapshot.awayTeam?.team_name ||
      snapshot.awayTeam?.full_name;
    const title =
      home && away
        ? `${home} vs ${away}`
        : snapshot.leagueName || `${item._id.matchId}`;

    return {
      matchId: item._id.matchId,
      sportType: item._id.sportType,
      title,
      totalVotes: item.totalVotes,
      sharePct:
        totalVotesWindow === 0
          ? 0
          : Math.round((item.totalVotes / totalVotesWindow) * 1000) / 10,
    };
  });

  const [recentVotes, recentUsers, recentSubs] = await Promise.all([
    UserPrediction.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("sportType matchId selectedTeamName createdAt")
      .lean(),
    User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("email createdAt")
      .lean(),
    UserSubscription.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("platform status createdAt")
      .lean(),
  ]);

  const recentActivity = [
    ...recentVotes.map((vote) => ({
      type: "vote",
      message: `New vote placed on ${vote.sportType || "Match"} (${vote.matchId})`,
      detail: vote.selectedTeamName,
      createdAt: vote.createdAt,
    })),
    ...recentSubs.map((sub) => ({
      type: "subscription",
      message: `Subscription ${sub.status || "updated"}`,
      detail: sub.platform,
      createdAt: sub.createdAt,
    })),
    ...recentUsers.map((user) => ({
      type: "user",
      message: "New user registration",
      detail: user.email,
      createdAt: user.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  const [
    activePremiumSubs,
    churnedSubs,
    newSubs30,
    prevSubs30,
    sessionSpans,
  ] = await Promise.all([
    UserSubscription.find({
      status: "active",
      isActive: true,
      subscriptionExpiryDate: { $gt: now.toDate() },
    }).lean(),
    UserSubscription.find({
      status: { $in: ["expired", "cancelled"] },
      subscriptionExpiryDate: { $gte: thirtyDaysAgo, $lte: now.toDate() },
    }).lean(),
    UserSubscription.countDocuments({
      subscriptionStartDate: { $gte: thirtyDaysAgo },
    }),
    UserSubscription.countDocuments({
      subscriptionStartDate: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    }),
    UserPrediction.aggregate([
      { $match: { createdAt: { $gte: now.subtract(1, "day").toDate() } } },
      {
        $group: {
          _id: "$user",
          first: { $min: "$createdAt" },
          last: { $max: "$createdAt" },
        },
      },
      {
        $project: {
          durationSeconds: { $divide: [{ $subtract: ["$last", "$first"] }, 1000] },
        },
      },
    ]),
  ]);

  const activePremiumCount = activePremiumSubs.length;
  const churnCount = churnedSubs.length;
  const churnRate =
    activePremiumCount + churnCount === 0
      ? 0
      : (churnCount / (activePremiumCount + churnCount)) * 100;

  const conversionRate =
    totalUsers === 0 ? 0 : (activePremiumCount / totalUsers) * 100;

  const subIds = [
    ...new Set(
      activePremiumSubs
        .map((sub) => sub.subscriptionId)
        .filter(Boolean)
        .map((id) => id.toString())
    ),
  ];

  const subscriptionDocs = subIds.length
    ? await Subscription.find({ _id: { $in: subIds } }).lean()
    : [];

  const priceMap = new Map(
    subscriptionDocs.map((doc) => [doc._id.toString(), parsePrice(doc.price)])
  );

  const monthlyRevenue = activePremiumSubs.reduce((sum, sub) => {
    const price = priceMap.get(sub.subscriptionId?.toString()) || 0;
    return sum + price;
  }, 0);

  const sessionSeconds =
    sessionSpans.length === 0
      ? 0
      : sessionSpans.reduce(
          (sum, span) => sum + (span.durationSeconds || 0),
          0
        ) / sessionSpans.length;

    res.json({
      votingTrends: {
        totalVotesToday: {
          value: totalVotesToday,
          changePct: percentChange(totalVotesToday, totalVotesYesterday),
        },
        participationRate: {
          value: participationRateToday,
          changePct: percentChange(
            participationRateToday,
            participationRateYesterday
          ),
        },
        avgVotesPerUser: {
          value: avgVotesPerUserToday,
          changePct: percentChange(
            avgVotesPerUserToday,
            avgVotesPerUserYesterday
          ),
        },
        peakVotingHour: {
          value: formatHour(peakHourToday),
          change:
            peakHourToday === null || peakHourYesterday === null
              ? "unknown"
              : peakHourToday === peakHourYesterday
              ? "same"
              : "shifted",
        },
      },
      topGames,
      recentActivity,
      subscriptionMetrics: {
        premiumSubscriptions: {
          value: activePremiumCount,
          changePct: percentChange(newSubs30, prevSubs30),
        },
        conversionRate: {
          value: conversionRate,
          changePct: null,
        },
        monthlyRevenue: {
          value: monthlyRevenue,
          currency: "USD",
        },
        churnRate: {
          value: churnRate,
          changePct: null,
        },
      },
      userEngagement: {
        dailyActiveUsers: {
          value: todayParticipants.length,
          changePct: percentChange(
            todayParticipants.length,
            yesterdayParticipants.length
          ),
        },
        avgSessionDurationSeconds: sessionSeconds,
      },
    });
  } catch (err) {
    console.error("Failed to build analytics summary", err);
    res
      .status(500)
      .json({ message: "Unable to load analytics summary. Please try again." });
  }
};

const getDashboardOverview = async (_req, res) => {
  try {
    const now = dayjs();
    const startToday = now.startOf("day").toDate();
    const startYesterday = now.subtract(1, "day").startOf("day").toDate();
    const startOfWeek = now.startOf("week").toDate();
    const endOfWeek = now.endOf("week").toDate();
    const startPrevWeek = dayjs(startOfWeek).subtract(7, "day").toDate();
    const endPrevWeek = dayjs(startOfWeek).subtract(1, "day").endOf("day").toDate();
    const startOfMonth = now.startOf("month").toDate();
    const startPrevMonth = dayjs(startOfMonth).subtract(1, "month").toDate();
    const endPrevMonth = dayjs(startOfMonth).subtract(1, "day").endOf("day").toDate();

    const [
      totalUsers,
      usersPrevMonth,
      totalVotesToday,
      totalVotesYesterday,
      participantsThisWeek,
      participantsPrevWeek,
      weeklyGamesAgg,
      recentGamesAgg,
    ] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      User.countDocuments({
        isDeleted: false,
        createdAt: { $gte: startPrevMonth, $lte: endPrevMonth },
      }),
      UserPrediction.countDocuments({ createdAt: { $gte: startToday } }),
      UserPrediction.countDocuments({
        createdAt: { $gte: startYesterday, $lt: startToday },
      }),
      UserPrediction.distinct("user", {
        createdAt: { $gte: startOfWeek, $lte: endOfWeek },
      }),
      UserPrediction.distinct("user", {
        createdAt: { $gte: startPrevWeek, $lte: endPrevWeek },
      }),
      UserPrediction.aggregate([
        {
          $match: {
            "providerSnapshot.scheduledAt": {
              $gte: startOfWeek,
              $lte: endOfWeek,
            },
          },
        },
        { $group: { _id: "$matchId" } },
      ]),
      UserPrediction.aggregate([
        { $match: { "providerSnapshot.scheduledAt": { $exists: true } } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: { matchId: "$matchId", sportType: "$sportType" },
            latestSnapshot: { $first: "$providerSnapshot" },
            scheduledAt: { $first: "$providerSnapshot.scheduledAt" },
            totalVotes: { $sum: 1 },
            latestCreatedAt: { $first: "$createdAt" },
          },
        },
        { $sort: { scheduledAt: -1, latestCreatedAt: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const activeGames = weeklyGamesAgg.length;
    const weeklyEngagementRate =
      totalUsers === 0 ? 0 : (participantsThisWeek.length / totalUsers) * 100;
    const prevWeeklyEngagementRate =
      totalUsers === 0 ? 0 : (participantsPrevWeek.length / totalUsers) * 100;

    const recentGames = recentGamesAgg.map((game) => {
      const snapshot = game.latestSnapshot || {};
      const home =
        snapshot.homeTeam?.name ||
        snapshot.homeTeam?.team_name ||
        snapshot.homeTeam?.full_name;
      const away =
        snapshot.awayTeam?.name ||
        snapshot.awayTeam?.team_name ||
        snapshot.awayTeam?.full_name;
      const title =
        home && away
          ? `${home} vs ${away}`
          : snapshot.leagueName || `${game._id.matchId}`;

      return {
        matchId: game._id.matchId,
        sportType: game._id.sportType,
        title,
        scheduledAt: snapshot.scheduledAt,
        network: snapshot.network || snapshot.leagueName || null,
        status: snapshot.status || null,
        totalVotes: game.totalVotes,
      };
    });

    res.json({
      metrics: {
        activeGames: {
          value: activeGames,
          change: null, // UI can display delta when prior week logic is defined
        },
        totalUsers: {
          value: totalUsers,
          change: totalUsers - usersPrevMonth,
        },
        activeVotesToday: {
          value: totalVotesToday,
          changePct: percentChange(totalVotesToday, totalVotesYesterday),
        },
        engagementRate: {
          value: weeklyEngagementRate,
          changePct: percentChange(
            weeklyEngagementRate,
            prevWeeklyEngagementRate
          ),
        },
      },
      recentGames,
    });
  } catch (err) {
    console.error("Failed to build dashboard overview", err);
    res
      .status(500)
      .json({ message: "Unable to load dashboard overview. Please try again." });
  }
};

module.exports = {
  getAnalyticsSummary,
  getDashboardOverview,
};
