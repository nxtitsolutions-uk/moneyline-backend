// controllers/americanFootballController.js
const { fetchAmericanFootballData } = require("../services/nflService");

// ----------------- Utility -----------------
exports.getTimezones = async (req, res) => {
  try {
    const data = await fetchAmericanFootballData("/timezone");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSeasons = async (req, res) => {
  try {
    const data = await fetchAmericanFootballData("/seasons");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------- Leagues -----------------
exports.getLeagues = async (req, res) => {
  try {
    const data = await fetchAmericanFootballData("/leagues");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------- Teams -----------------
exports.getTeams = async (req, res) => {
  try {
    const { league, season, id, name } = req.query;
    let endpoint = "/teams?";
    if (id) endpoint += `id=${id}&`;
    if (league) endpoint += `league=${league}&`;
    if (season) endpoint += `season=${season}&`;
    if (name) endpoint += `search=${name}&`;
    const data = await fetchAmericanFootballData(endpoint);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------- Players -----------------
exports.getPlayers = async (req, res) => {
  try {
    const { id, team, name, season } = req.query;
    let endpoint = "/players?";
    if (id) endpoint += `id=${id}&`;
    if (team) endpoint += `team=${team}&`;
    if (season) endpoint += `season=${season}&`;
    if (name) endpoint += `search=${name}&`;
    const data = await fetchAmericanFootballData(endpoint);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlayerStatistics = async (req, res) => {
  try {
    const { id, team, season } = req.query;
    let endpoint = `/players/statistics?season=${season}`;
    if (id) endpoint += `&id=${id}`;
    if (team) endpoint += `&team=${team}`;
    const data = await fetchAmericanFootballData(endpoint);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------- Injuries -----------------
exports.getInjuries = async (req, res) => {
  try {
    const { player, team } = req.query;
    let endpoint = `/injuries?`;
    if (player) endpoint += `player=${player}&`;
    if (team) endpoint += `team=${team}&`;
    const data = await fetchAmericanFootballData(endpoint);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------- Games -----------------
exports.getGames = async (req, res) => {
  try {
    const { id, date, league, season, team, h2h, live, timezone } = req.query;
    let endpoint = `/games?`;
    if (id) endpoint += `id=${id}&`;
    if (date) endpoint += `date=${date}&`;
    if (league) endpoint += `league=${league}&`;
    if (season) endpoint += `season=${season}&`;
    if (team) endpoint += `team=${team}&`;
    if (h2h) endpoint += `h2h=${h2h}&`;
    if (live) endpoint += `live=${live}&`;
    if (timezone) endpoint += `timezone=${timezone}&`;
    const data = await fetchAmericanFootballData(endpoint);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGameEvents = async (req, res) => {
  try {
    const { id } = req.query;
    const data = await fetchAmericanFootballData(`/games/events?id=${id}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGameTeamStats = async (req, res) => {
  try {
    const { id, team } = req.query;
    let endpoint = `/games/statistics/teams?id=${id}`;
    if (team) endpoint += `&team=${team}`;
    const data = await fetchAmericanFootballData(endpoint);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGamePlayerStats = async (req, res) => {
  try {
    const { id, team, player, group } = req.query;
    let endpoint = `/games/statistics/players?id=${id}`;
    if (team) endpoint += `&team=${team}`;
    if (player) endpoint += `&player=${player}`;
    if (group) endpoint += `&group=${group}`;
    const data = await fetchAmericanFootballData(endpoint);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------- Standings -----------------
exports.getStandings = async (req, res) => {
  try {
    const { league, season, team, conference, division } = req.query;
    let endpoint = `/standings?league=${league}&season=${season}`;
    if (team) endpoint += `&team=${team}`;
    if (conference) endpoint += `&conference=${conference}`;
    if (division) endpoint += `&division=${division}`;
    const data = await fetchAmericanFootballData(endpoint);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------- Odds -----------------
exports.getOdds = async (req, res) => {
  try {
    const { game, bookmaker, bet } = req.query;
    let endpoint = `/odds?game=${game}`;
    if (bookmaker) endpoint += `&bookmaker=${bookmaker}`;
    if (bet) endpoint += `&bet=${bet}`;
    const data = await fetchAmericanFootballData(endpoint);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBets = async (req, res) => {
  try {
    const { id, search } = req.query;
    let endpoint = `/odds/bets?`;
    if (id) endpoint += `id=${id}&`;
    if (search) endpoint += `search=${search}&`;
    const data = await fetchAmericanFootballData(endpoint);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBookmakers = async (req, res) => {
  try {
    const { id, search } = req.query;
    let endpoint = `/odds/bookmakers?`;
    if (id) endpoint += `id=${id}&`;
    if (search) endpoint += `search=${search}&`;
    const data = await fetchAmericanFootballData(endpoint);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
