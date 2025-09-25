const express = require("express");
const football = require("../controllers/footballController");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Football
 *   description: Football API endpoints
 */

/**
 * @swagger
 * /football/leagues:
 *   get:
 *     summary: Get all leagues
 *     tags: [Football]
 *     responses:
 *       200:
 *         description: List of leagues
 */
router.get("/leagues", football.getAllLeagues);

/**
 * @swagger
 * /football/leagues/{leagueId}:
 *   get:
 *     summary: Get league by ID
 *     tags: [Football]
 *     parameters:
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: League details
 */
router.get("/leagues/:leagueId", football.getLeagueById);

/**
 * @swagger
 * /football/teams/{teamId}:
 *   get:
 *     summary: Get team by ID
 *     tags: [Football]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Team details
 */
router.get("/teams/:teamId", football.getTeamById);

/**
 * @swagger
 * /football/teams/league/{leagueId}:
 *   get:
 *     summary: Get all teams in a league
 *     tags: [Football]
 *     parameters:
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of teams
 */
router.get("/teams/league/:leagueId", football.getTeamsByLeague);

/**
 * @swagger
 * /football/fixtures/id/{fixtureId}:
 *   get:
 *     summary: Get fixture by ID
 *     tags: [Football]
 *     parameters:
 *       - in: path
 *         name: fixtureId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fixture details
 */
router.get("/fixtures/id/:fixtureId", football.getFixtureById);

/**
 * @swagger
 * /football/fixtures/date/{date}:
 *   get:
 *     summary: Get fixtures by date
 *     tags: [Football]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-09-20
 *     responses:
 *       200:
 *         description: Fixtures on the given date
 */
router.get("/fixtures/date/:date", football.getFixturesByDate);

/**
 * @swagger
 * /football/fixtures/live:
 *   get:
 *     summary: Get live fixtures
 *     tags: [Football]
 *     responses:
 *       200:
 *         description: List of live fixtures
 */
router.get("/fixtures/live", football.getLiveFixtures);

/**
 * @swagger
 * /football/players/search/{name}:
 *   get:
 *     summary: Search players by name
 *     tags: [Football]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         example: messi
 *     responses:
 *       200:
 *         description: Player search results
 */
router.get("/players/search/:name", football.searchPlayer);

/**
 * @swagger
 * /football/players/{playerId}/{season}:
 *   get:
 *     summary: Get player stats for a season
 *     tags: [Football]
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: season
 *         required: true
 *         schema:
 *           type: string
 *         example: 2019-2020
 *     responses:
 *       200:
 *         description: Player statistics
 */
router.get("/players/:playerId/:season", football.getPlayerStats);

/**
 * @swagger
 * /football/standings/{leagueId}:
 *   get:
 *     summary: Get standings for a league
 *     tags: [Football]
 *     parameters:
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: League standings
 */
router.get("/standings/:leagueId", football.getStandings);

/**
 * @swagger
 * /football/stats/team/{leagueId}/{teamId}:
 *   get:
 *     summary: Get team statistics in a league
 *     tags: [Football]
 *     parameters:
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Team statistics
 */
router.get("/stats/team/:leagueId/:teamId", football.getTeamStatistics);

module.exports = router;
