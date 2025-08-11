const express = require("express");
const router = express.Router();
const cricketController = require("../controllers/cricketController");

/**
 * @swagger
 * tags:
 *   name: Cricket
 *   description: Cricket data (Sportradar) – schedules & lineups
 */

/**
 * @swagger
 * /cricket/schedules/{date}:
 *   get:
 *     summary: Get daily cricket schedule (cached & backed up)
 *     description: Returns the schedule for a specific date. Non-live/static data is saved in MongoDB (Latest + Snapshots) and refreshed on interval or when stale.
 *     tags: [Cricket]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"
 *         example: "2025-08-10"
 *         description: Date in YYYY-MM-DD
 *       - in: query
 *         name: locale
 *         required: false
 *         schema:
 *           type: string
 *           example: en
 *         description: Locale for Sportradar content (default "en")
 *     responses:
 *       200:
 *         description: Schedule fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 source:
 *                   type: string
 *                   description: origin | db
 *                   example: db
 *                 payload:
 *                   type: object
 *                   description: Raw Sportradar schedule payload
 *       400:
 *         description: Bad request (invalid date)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal error
 */
router.get("/schedules/:date", cricketController.getScheduleByDate);

/**
 * @swagger
 * /cricket/matches/{urn}/lineups:
 *   get:
 *     summary: Get lineups for a match (live-first; no backup when live)
 *     description: Always fetches from Sportradar first. If the match is not live, the latest snapshot is saved. If vendor fails and a non-live Latest exists, that is returned.
 *     tags: [Cricket]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: urn
 *         required: true
 *         schema:
 *           type: string
 *           example: "sr:match:28669992"
 *         description: Sportradar match URN
 *       - in: query
 *         name: locale
 *         required: false
 *         schema:
 *           type: string
 *           example: en
 *         description: Locale for Sportradar content (default "en")
 *     responses:
 *       200:
 *         description: Lineups fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 source:
 *                   type: string
 *                   description: live | origin | db-fallback
 *                   example: live
 *                 payload:
 *                   type: object
 *                   description: Raw Sportradar lineups payload
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Match not found
 *       500:
 *         description: Internal error
 */
router.get("/matches/:urn/lineups", cricketController.getLineups);

/**
 * @swagger
 * /cricket/db/latest/{feed}/{id}:
 *   get:
 *     summary: Get latest backed-up cricket data from DB
 *     tags: [Cricket]
 *     parameters:
 *       - in: path
 *         name: feed
 *         required: true
 *         schema:
 *           type: string
 *           example: schedules
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-08-10"
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *           example: en
 *     responses:
 *       200:
 *         description: Latest backup from DB
 *       404:
 *         description: No backup found
 */
router.get("/db/latest/:feed/:id", cricketController.getLatestFromDb);

/**
 * @swagger
 * /cricket/db/snapshots/{feed}/{id}:
 *   get:
 *     summary: Get all historical snapshots for a cricket resource
 *     tags: [Cricket]
 *     parameters:
 *       - in: path
 *         name: feed
 *         required: true
 *         schema:
 *           type: string
 *           example: schedules
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-08-10"
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *           example: en
 *     responses:
 *       200:
 *         description: List of snapshots from DB
 *       404:
 *         description: No snapshots found
 */
router.get("/db/snapshots/:feed/:id", cricketController.getSnapshotsFromDb);


module.exports = router;
