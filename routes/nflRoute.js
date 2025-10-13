// routes/americanFootballRoutes.js
const express = require("express");
const nfl = require("../controllers/nflController");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: NFL
 *   description: American Football (NFL & NCAA) API endpoints
 */

/**
 * @swagger
 * /nfl/timezone:
 *   get:
 *     summary: Get all available timezones
 *     tags: [NFL]
 *     responses:
 *       200:
 *         description: List of timezones
 */
router.get("/timezone", nfl.getTimezones);

/**
 * @swagger
 * /nfl/seasons:
 *   get:
 *     summary: Get all available seasons
 *     tags: [NFL]
 *     responses:
 *       200:
 *         description: List of seasons
 */
router.get("/seasons", nfl.getSeasons);

/**
 * @swagger
 * /nfl/leagues:
 *   get:
 *     summary: Get all leagues
 *     tags: [NFL]
 *     responses:
 *       200:
 *         description: List of leagues
 */
router.get("/leagues", nfl.getLeagues);

/**
 * @swagger
 * /nfl/teams:
 *   get:
 *     summary: Get teams (by id, league, season, or search)
 *     tags: [NFL]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema: { type: integer }
 *       - in: query
 *         name: league
 *         schema: { type: integer }
 *       - in: query
 *         name: season
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Teams data
 */
router.get("/teams", nfl.getTeams);

/**
 * @swagger
 * /nfl/players:
 *   get:
 *     summary: Get players (by id, team, season, or search)
 *     tags: [NFL]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema: { type: integer }
 *       - in: query
 *         name: team
 *         schema: { type: integer }
 *       - in: query
 *         name: season
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Players data
 */
router.get("/players", nfl.getPlayers);

/**
 * @swagger
 * /nfl/players/statistics:
 *   get:
 *     summary: Get player statistics for a season
 *     tags: [NFL]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema: { type: integer }
 *       - in: query
 *         name: team
 *         schema: { type: integer }
 *       - in: query
 *         name: season
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Player statistics
 */
router.get("/players/statistics", nfl.getPlayerStatistics);

/**
 * @swagger
 * /nfl/injuries:
 *   get:
 *     summary: Get current injuries
 *     tags: [NFL]
 *     parameters:
 *       - in: query
 *         name: player
 *         schema: { type: integer }
 *       - in: query
 *         name: team
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of injured players
 */
router.get("/injuries", nfl.getInjuries);

/**
 * @swagger
 * /nfl/games:
 *   get:
 *     summary: Get games (by id, date, league, season, team, h2h, live, timezone)
 *     tags: [NFL]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema: { type: integer }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: league
 *         schema: { type: integer }
 *       - in: query
 *         name: season
 *         schema: { type: integer }
 *       - in: query
 *         name: team
 *         schema: { type: integer }
 *       - in: query
 *         name: h2h
 *         schema: { type: string }
 *       - in: query
 *         name: live
 *         schema: { type: string }
 *       - in: query
 *         name: timezone
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Games data
 */
router.get("/games", nfl.getGames);

/**
 * @swagger
 * /nfl/games/events:
 *   get:
 *     summary: Get game events by game ID
 *     tags: [NFL]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Game events
 */
router.get("/games/events", nfl.getGameEvents);

/**
 * @swagger
 * /nfl/games/statistics/teams:
 *   get:
 *     summary: Get team statistics from a game
 *     tags: [NFL]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: team
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Team statistics
 */
router.get("/games/statistics/teams", nfl.getGameTeamStats);

/**
 * @swagger
 * /nfl/games/statistics/players:
 *   get:
 *     summary: Get player statistics from a game
 *     tags: [NFL]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: team
 *         schema: { type: integer }
 *       - in: query
 *         name: player
 *         schema: { type: integer }
 *       - in: query
 *         name: group
 *         schema: 
 *           type: string
 *           enum: [defensive, fumbles, interceptions, kick_returns, kicking, passing, punt_returns, punting, receiving, rushing]
 *     responses:
 *       200:
 *         description: Player statistics for game
 */
router.get("/games/statistics/players", nfl.getGamePlayerStats);

/**
 * @swagger
 * /nfl/standings:
 *   get:
 *     summary: Get standings for a league
 *     tags: [NFL]
 *     parameters:
 *       - in: query
 *         name: league
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: season
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: team
 *         schema: { type: integer }
 *       - in: query
 *         name: conference
 *         schema: { type: string }
 *       - in: query
 *         name: division
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: League standings
 */
router.get("/standings", nfl.getStandings);

/**
 * @swagger
 * /nfl/odds:
 *   get:
 *     summary: Get odds for a game
 *     tags: [NFL]
 *     parameters:
 *       - in: query
 *         name: game
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: bookmaker
 *         schema: { type: integer }
 *       - in: query
 *         name: bet
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Odds for a game
 */
router.get("/odds", nfl.getOdds);

/**
 * @swagger
 * /nfl/odds/bets:
 *   get:
 *     summary: Get available bets
 *     tags: [NFL]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of bets
 */
router.get("/odds/bets", nfl.getBets);

/**
 * @swagger
 * /nfl/odds/bookmakers:
 *   get:
 *     summary: Get available bookmakers
 *     tags: [NFL]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of bookmakers
 */
router.get("/odds/bookmakers", nfl.getBookmakers);

module.exports = router;
