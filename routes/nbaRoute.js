// // routes/nbaRoutes.js
// const express = require("express");
// const nba = require("../controllers/nbaController");
// const router = express.Router();

// /**
//  * @swagger
//  * tags:
//  *   name: NBA
//  *   description: NBA API endpoints
//  */

// /**
//  * @swagger
//  * /nba/leagues:
//  *   get:
//  *     summary: Get all NBA leagues
//  *     tags: [NBA]
//  */
// router.get("/leagues", nba.getAllLeagues);

// /**
//  * @swagger
//  * /nba/seasons:
//  *   get:
//  *     summary: Get all NBA seasons
//  *     tags: [NBA]
//  */
// router.get("/seasons", nba.getSeasons);

// /**
//  * @swagger
//  * /nba/teams/{teamId}:
//  *   get:
//  *     summary: Get team by ID
//  *     tags: [NBA]
//  */
// router.get("/teams/:teamId", nba.getTeamById);

// /**
//  * @swagger
//  * /nba/teams/statistics/{teamId}/{season}:
//  *   get:
//  *     summary: Get team statistics for a season
//  *     tags: [NBA]
//  */
// router.get("/teams/statistics/:teamId/:season", nba.getTeamStatistics);

// /**
//  * @swagger
//  * /nba/games/{gameId}:
//  *   get:
//  *     summary: Get game by ID
//  *     tags: [NBA]
//  */
// router.get("/games/:gameId", nba.getGameById);

// /**
//  * @swagger
//  * /nba/games/date/{date}:
//  *   get:
//  *     summary: Get games by date
//  *     tags: [NBA]
//  */
// router.get("/games/date/:date", nba.getGamesByDate);

// /**
//  * @swagger
//  * /nba/players/search/{name}:
//  *   get:
//  *     summary: Search players by name
//  *     tags: [NBA]
//  */
// router.get("/players/search/:name", nba.searchPlayer);

// /**
//  * @swagger
//  * /nba/players/{playerId}:
//  *   get:
//  *     summary: Get player by ID
//  *     tags: [NBA]
//  */
// router.get("/players/:playerId", nba.getPlayerById);

// /**
//  * @swagger
//  * /nba/players/statistics/{playerId}/{season}:
//  *   get:
//  *     summary: Get player statistics for a season
//  *     tags: [NBA]
//  */
// router.get("/players/statistics/:playerId/:season", nba.getPlayerStatistics);

// /**
//  * @swagger
//  * /nba/standings/{league}/{season}:
//  *   get:
//  *     summary: Get standings for a league and season
//  *     tags: [NBA]
//  */
// router.get("/standings/:league/:season", nba.getStandings);

// module.exports = router;
