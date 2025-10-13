// controllers/nbaController.js
const { fetchNBAData } = require("../services/nbaService");

// ----------------- Leagues -----------------
exports.getAllLeagues = async (req, res) => {
  try {
    const data = await fetchNBAData("/leagues");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------- Seasons -----------------
exports.getSeasons = async (req, res) => {
  try {
    const data = await fetchNBAData("/seasons");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------- Teams -----------------
exports.getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;
    const data = await fetchNBAData(`/teams?id=${teamId}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeamStatistics = async (req, res) => {
  try {
    const { teamId, season } = req.params;
    const data = await fetchNBAData(`/teams/statistics?team=${teamId}&season=${season}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------- Games -----------------
exports.getGameById = async (req, res) => {
  try {
    const { gameId } = req.params;
    const data = await fetchNBAData(`/games?id=${gameId}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGamesByDate = async (req, res) => {
  try {
    const { date } = req.params; // YYYY-MM-DD
    const data = await fetchNBAData(`/games?date=${date}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------- Players -----------------
exports.searchPlayer = async (req, res) => {
  try {
    const { name } = req.params;
    const data = await fetchNBAData(`/players?name=${name}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlayerById = async (req, res) => {
  try {
    const { playerId } = req.params;
    const data = await fetchNBAData(`/players?id=${playerId}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlayerStatistics = async (req, res) => {
  try {
    const { playerId, season } = req.params;
    const data = await fetchNBAData(`/players/statistics?id=${playerId}&season=${season}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------- Standings -----------------
exports.getStandings = async (req, res) => {
  try {
    const { league, season } = req.params;
    const data = await fetchNBAData(`/standings?league=${league}&season=${season}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
