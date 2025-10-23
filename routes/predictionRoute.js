// routes/predictionRoutes.js
const express = require("express");
const router = express.Router();
const prediction = require("../controllers/predictionController");
// const { verifyUser } = require("../middlewares/authMiddleware"); // ensure req.user exists

/**
 * @swagger
 * tags:
 *   name: Predictions
 *   description: User predictions across all sports
 */

/**
 * @swagger
 * /predictions:
 *   post:
 *     summary: Create or upsert a user prediction for a match
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
 *               selectedTeamId:
 *                 type: string
 *               selectedTeamName:
 *                 type: string
 *               timezone:
 *                 type: string
 *                 example: "America/New_York"
 *     responses:
 *       200:
 *         description: Prediction saved
 */
router.post("/", prediction.createOrUpsertPrediction);

/**
 * @swagger
 * /predictions/{sportType}/{matchId}:
 *   get:
 *     summary: Get the current user's prediction for a match
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
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: A prediction
 *       404:
 *         description: Not found
 */
router.get("/:sportType/:matchId", prediction.getUserPrediction);

/**
 * @swagger
 * /predictions/{sportType}/{matchId}:
 *   put:
 *     summary: Update a user's prediction (if not locked/settled)
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
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [selectedTeamId, selectedTeamName]
 *             properties:
 *               selectedTeamId: { type: string }
 *               selectedTeamName: { type: string }
 *     responses:
 *       200: { description: Prediction updated }
 *       403: { description: Prediction locked or settled }
 *       404: { description: Not found }
 */
router.put("/:sportType/:matchId", prediction.updatePrediction);

/**
 * @swagger
 * /predictions/{sportType}/{matchId}:
 *   delete:
 *     summary: Delete the user's prediction for a match
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
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 *       404: { description: Not found }
 */
router.delete("/:sportType/:matchId", prediction.deletePrediction);

/**
 * @swagger
 * /predictions:
 *   get:
 *     summary: List the current user's predictions (raw)
 *     tags: [Predictions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: sportType
 *         schema:
 *           type: string
 *           enum: [NFL, NBA, SOCCER, CRICKET, NHL, MLB, UFC]
 *       - in: query
 *         name: settled
 *         schema: { type: string, enum: [true, false] }
 *     responses:
 *       200: { description: Paginated predictions }
 */
router.get("/", prediction.listUserPredictions);

/**
 * @swagger
 * /predictions/overview:
 *   get:
 *     summary: Get accuracy + Figma-style card list (current user)
 *     tags: [Predictions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: windowDays
 *         schema: { type: integer, default: 30 }
 *         description: Rolling window (days) for accuracy, default 30.
 *       - in: query
 *         name: compare
 *         schema: { type: string, enum: [true, false], default: true }
 *         description: Compare vs previous window to compute delta.
 *       - in: query
 *         name: sportType
 *         schema:
 *           type: string
 *           enum: [NFL, NBA, SOCCER, CRICKET, NHL, MLB, UFC]
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: timezone
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Accuracy summary + predictions cards
 */
router.get("/overview", prediction.getOverview);

module.exports = router;
