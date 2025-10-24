// services/matchResultService.js
// Retrieves normalized and full match data from live APIs (currently NFL)

const dayjs = require("dayjs");

let fetchAmericanFootballData;
try {
  ({ fetchAmericanFootballData } = require("./americanFootballService"));
} catch {
  ({ fetchAmericanFootballData } = require("./nflService"));
}

const toStr = (v) => (v === undefined || v === null ? "" : String(v));

/**
 * Returns both normalized fields for UI and full JSON for archival.
 * {
 *   finished, winnerTeamId, winnerTeamName,
 *   leagueName, scheduledAt, status,
 *   home, away,
 *   fullRaw
 * }
 */
async function getMatchResult({ sportType, matchId, timezone }) {
  sportType = toStr(sportType).toUpperCase();

  switch (sportType) {
    case "NFL": {
      const endpoint = `/games?id=${encodeURIComponent(matchId)}${
        timezone ? `&timezone=${encodeURIComponent(timezone)}` : ""
      }`;
      const data = await fetchAmericanFootballData(endpoint);
      const game = Array.isArray(data?.response) ? data.response[0] : null;
      if (!game) return { finished: false };

      const status = game?.status?.short || game?.status?.long || "";
      const finished =
        ["FT", "AOT", "OT", "Match Finished"].includes(status) ||
        (status && status.toUpperCase().includes("FT"));

      const leagueName = game?.league?.name;
      const scheduledAt = new Date(game?.date?.date);

      const home = {
        id: toStr(game?.teams?.home?.id),
        name: game?.teams?.home?.name,
        logo: game?.teams?.home?.logo,
        score: game?.scores?.home?.total ?? null,
      };
      const away = {
        id: toStr(game?.teams?.away?.id),
        name: game?.teams?.away?.name,
        logo: game?.teams?.away?.logo,
        score: game?.scores?.away?.total ?? null,
      };

      const homeWin =
        home.score !== null && away.score !== null && home.score > away.score;
      const awayWin =
        home.score !== null && away.score !== null && away.score > home.score;

      const winnerTeamId = homeWin ? home.id : awayWin ? away.id : null;
      const winnerTeamName = homeWin ? home.name : awayWin ? away.name : null;

      return {
        finished,
        winnerTeamId,
        winnerTeamName,
        leagueName,
        scheduledAt: scheduledAt ? dayjs(scheduledAt).toDate() : null,
        status,
        home,
        away,
        fullRaw: game, // store full live JSON
      };
    }

    default:
      return { finished: false };
  }
}

module.exports = { getMatchResult };
