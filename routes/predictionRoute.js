// routes/predictionRoutes.js
const express = require("express");
const router = express.Router();
const prediction = require("../controllers/predictionController");
// const { authenticate } = require("../middlewares/authMiddleware"); // ensure req.user is attached

/**
 * @swagger
 * tags:
 *   name: Predictions
 *   description: User predictions for all supported sports (NFL, NBA, SOCCER, CRICKET, etc.)
 */

/**
 * @swagger
 * /predictions:
 *   post:
 *     summary: Create or update a user's prediction for a match
 *     description: Stores a user's prediction for a given match and sport. If a prediction already exists, it is updated with new data. Automatically fetches the latest match info snapshot at creation time.
 *     tags: [Predictions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sportType, matchId, selectedTeamId, selectedTeamName]
 *             properties:
 *               sportType:
 *                 type: string
 *                 enum: [NFL, NBA, SOCCER, CRICKET, NHL, MLB, UFC]
 *               matchId:
 *                 type: string
 *                 description: External provider's match identifier.
 *               selectedTeamId:
 *                 type: string
 *                 description: Team ID user predicts will win.
 *               selectedTeamName:
 *                 type: string
 *                 description: Team name user predicts will win.
 *               timezone:
 *                 type: string
 *                 example: "America/New_York"
 *     responses:
 *       200:
 *         description: Prediction created or updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Duplicate prediction already exists
 *       500:
 *         description: Server error
 */
router.post("/", prediction.createOrUpsertPrediction);

/**
 * @swagger
 * /predictions/{sportType}/{matchId}:
 *   get:
 *     summary: Retrieve a user's prediction for a specific match
 *     description: Returns the stored prediction, including provider snapshot and (if settled) final match result JSON.
 *     tags: [Predictions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sportType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [NFL, NBA, SOCCER, CRICKET, NHL, MLB, UFC]
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User prediction data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No prediction found for this match
 */
router.get("/:sportType/:matchId", prediction.getUserPrediction);

/**
 * @swagger
 * /predictions/{sportType}/{matchId}:
 *   put:
 *     summary: Update a user's prediction (if not yet settled)
 *     description: Allows a user to modify their prediction before the match is settled. After settlement, updates are blocked.
 *     tags: [Predictions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sportType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [NFL, NBA, SOCCER, CRICKET, NHL, MLB, UFC]
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [selectedTeamId, selectedTeamName]
 *             properties:
 *               selectedTeamId:
 *                 type: string
 *               selectedTeamName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prediction updated successfully
 *       403:
 *         description: Prediction is locked or already settled
 *       404:
 *         description: No prediction found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put("/:sportType/:matchId", prediction.updatePrediction);

/**
 * @swagger
 * /predictions/{sportType}/{matchId}:
 *   delete:
 *     summary: Delete a user's prediction
 *     description: Removes the specified prediction permanently.
 *     tags: [Predictions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sportType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [NFL, NBA, SOCCER, CRICKET, NHL, MLB, UFC]
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prediction deleted successfully
 *       404:
 *         description: No prediction found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete("/:sportType/:matchId", prediction.deletePrediction);

/**
 * @swagger
 * /predictions:
 *   get:
 *     summary: List user's predictions
 *     description: Paginated list of all predictions made by the current user, with optional filtering by sport type.
 *     tags: [Predictions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sportType
 *         schema:
 *           type: string
 *           enum: [NFL, NBA, SOCCER, CRICKET, NHL, MLB, UFC]
 *       - in: query
 *         name: settled
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Paginated list of predictions
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", prediction.listUserPredictions);

/**
 * @swagger
 * /predictions/overview:
 *   get:
 *     summary: Get user's prediction overview (accuracy + cards)
 *     description: Returns user's overall accuracy and list of recent predictions. Automatically updates results if match has finished, and includes full `matchResult` JSON for completed matches.
 *     tags: [Predictions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: windowDays
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Time window (in days) to calculate accuracy.
 *       - in: query
 *         name: sportType
 *         schema:
 *           type: string
 *           enum: [NFL, NBA, SOCCER, CRICKET, NHL, MLB, UFC]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: timezone
 *         schema:
 *           type: string
 *           example: "America/New_York"
 *     responses:
 *       200:
 *         description: Overview data (accuracy + predictions cards)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accuracy:
 *                   type: object
 *                   properties:
 *                     percent: { type: integer }
 *                     status: { type: string }
 *                     windowDays: { type: integer }
 *                 predictions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sportType: { type: string }
 *                       league: { type: string }
 *                       matchId: { type: string }
 *                       time: { type: string }
 *                       status: { type: string }
 *                       homeTeam: { type: object }
 *                       awayTeam: { type: object }
 *                       myPrediction: { type: string }
 *                       result: { type: string }
 *                       matchResult: { type: object }
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/overview", prediction.getOverview);

module.exports = router;
