// services/matchResultService.js
// One place to read results from your existing live services without changing them.
// Currently implemented for NFL using your americanFootball service.
// Extend switch-case for NBA, SOCCER, etc. as you add their services.

const dayjs = require("dayjs");

function toStr(v) {
  return v === undefined || v === null ? "" : String(v);
}

// Import your existing NFL fetcher (do NOT modify existing service)
let fetchAmericanFootballData;
try {
  // You showed two variations; prefer americanFootballService.js
  ({ fetchAmericanFootballData } = require("./americanFootballService"));
} catch {
  // fallback: if your project exports it from nflService
  ({ fetchAmericanFootballData } = require("./nflService"));
}

/**
 * Normalize common game fields for UI cards and correctness checks.
 * Return shape:
 * {
 *   finished: boolean,
 *   winnerTeamId?: string,
 *   winnerTeamName?: string,
 *   leagueName?: string,
 *   scheduledAt?: Date,
 *   status?: string, // "NS","LIVE","FT"...
 *   home: { id, name, logo, score },
 *   away: { id, name, logo, score }
 * }
 */
async function getMatchResult({ sportType, matchId, timezone }) {
  sportType = toStr(sportType).toUpperCase();

  switch (sportType) {
    case "NFL": {
      // API-SPORTS (american-football) games endpoint returns an array
      const ep = `/games?id=${encodeURIComponent(matchId)}${
        timezone ? `&timezone=${encodeURIComponent(timezone)}` : ""
      }`;
      const data = await fetchAmericanFootballData(ep);

      const game = Array.isArray(data?.response) ? data.response[0] : null;
      if (!game) {
        return { finished: false }; // unknown -> do not settle
      }

      const status = game?.status?.short || game?.status?.long || "";
      const leagueName = game?.league?.name || "";
      const scheduledAt =
        game?.date?.date || game?.date?.timezone
          ? new Date(game.date.date)
          : undefined;

      const home = {
        id: toStr(game?.teams?.home?.id),
        name: game?.teams?.home?.name,
        logo: game?.teams?.home?.logo,
        score: game?.scores?.home?.total ?? game?.scores?.home ?? undefined,
      };
      const away = {
        id: toStr(game?.teams?.away?.id),
        name: game?.teams?.away?.name,
        logo: game?.teams?.away?.logo,
        score: game?.scores?.away?.total ?? game?.scores?.away ?? undefined,
      };

      // API often gives winner via "winner": true flags
      const homeWinner =
        game?.teams?.home?.winner === true ||
        (typeof home.score === "number" &&
          typeof away.score === "number" &&
          home.score > away.score);

      const awayWinner =
        game?.teams?.away?.winner === true ||
        (typeof home.score === "number" &&
          typeof away.score === "number" &&
          away.score > home.score);

      const finished =
        ["FT", "AOT", "OT", "FT_PEN", "FT_OT", "After ET", "Match Finished"].includes(
          status
        ) ||
        (typeof home.score === "number" &&
          typeof away.score === "number" &&
          status && status.toUpperCase().includes("FT"));

      const winnerTeamId = homeWinner ? home.id : awayWinner ? away.id : undefined;
      const winnerTeamName = homeWinner
        ? home.name
        : awayWinner
        ? away.name
        : undefined;

      return {
        finished,
        winnerTeamId,
        winnerTeamName,
        leagueName,
        scheduledAt: scheduledAt ? dayjs(scheduledAt).toDate() : undefined,
        status,
        home,
        away,
      };
    }

    // TODO: Add other sports adapters here without touching callers:
    // case "NBA": { ... }
    // case "SOCCER": { ... }
    // case "CRICKET": { ... }
    // etc.

    default:
      // Unknown sport adapter -> do not settle
      return { finished: false };
  }
}

module.exports = { getMatchResult };
