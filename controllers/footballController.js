const { fetchData } = require("../services/footballService");

// ----------------- Leagues -----------------
exports.getAllLeagues = async (req, res) => {
  try {
    const data = await fetchData("/leagues");
    console.log("================leagues===============",data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLeagueById = async (req, res) => {
  try {
    const { leagueId } = req.params;
    const data = await fetchData(`/leagues/league/${leagueId}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------- Teams -----------------
exports.getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;
    const data = await fetchData(`/teams/team/${teamId}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeamsByLeague = async (req, res) => {
  try {
    const { leagueId } = req.params;
    const data = await fetchData(`/teams/league/${leagueId}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------- Fixtures -----------------
exports.getFixtureById = async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const data = await fetchData(`/fixtures/id/${fixtureId}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFixturesByDate = async (req, res) => {
  try {
    const { date } = req.params; // YYYY-MM-DD
    const data = await fetchData(`/fixtures/date/${date}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLiveFixtures = async (req, res) => {
  try {
    const data = await fetchData(`/fixtures/live`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------- Players -----------------
exports.searchPlayer = async (req, res) => {
  try {
    const { name } = req.params;
    const data = await fetchData(`/players/search/${name}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlayerStats = async (req, res) => {
  try {
    const { playerId, season } = req.params;
    const data = await fetchData(`/players/player/${playerId}/${season}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------- Stats / Standings -----------------
exports.getStandings = async (req, res) => {
  try {
    const { leagueId } = req.params;
    const data = await fetchData(`/leagueTable/${leagueId}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeamStatistics = async (req, res) => {
  try {
    const { leagueId, teamId } = req.params;
    const data = await fetchData(`/statistics/${leagueId}/${teamId}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
