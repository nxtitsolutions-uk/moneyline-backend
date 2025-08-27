const express = require('express');
const router = express.Router();
const sportsController = require('../controllers/sportsController');

/**
 * @swagger
 * tags:
 *   name: Sports
 *   description: Sports and Teams APIs
 */

/**
 * @swagger
 * /sports:
 *   get:
 *     summary: Get list of all sports
 *     tags: [Sports]
 *     responses:
 *       200:
 *         description: List of sports fetched successfully
 *       500:
 *         description: Failed to fetch sports
 */
router.get('/', sportsController.listSports);

/**
 * @swagger
 * /sports/{slug}/teams:
 *   get:
 *     summary: Get teams of a specific sport
 *     tags: [Sports]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: Slug of the sport (e.g., "cricket", "nba")
 *       - in: query
 *         name: league
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional league filter (e.g., "ICC", "NBA")
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional country filter (e.g., "India", "USA")
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional search term to filter teams by name
 *     responses:
 *       200:
 *         description: Teams fetched successfully
 *       404:
 *         description: Sport not found
 *       500:
 *         description: Failed to fetch teams
 */
router.get('/:slug/teams', sportsController.listTeamsBySport);

module.exports = router;
