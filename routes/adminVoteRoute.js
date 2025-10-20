// routes/adminVoteRoutes.js
const express = require("express");
const router = express.Router();
const adminVoteController = require("../controllers/adminVoteController");
// const { verifyAdmin } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Sports Admin
 *   description: Admin actions for multi-sport match predictions and votes
 */

/**
 * @swagger
 * /admin/vote:
 *   post:
 *     summary: Create or upsert a global admin vote for a match (sportType + matchId)
 *     tags: [Sports Admin]
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
 *                 description: Sport category for this vote.
 *                 example: "NFL"
 *               matchId:
 *                 type: string
 *                 description: External provider's match/game identifier.
 *                 example: "14252"
 *               selectedTeamId:
 *                 type: string
 *                 description: External provider's team identifier.
 *                 example: "22"
 *               selectedTeamName:
 *                 type: string
 *                 description: Team name admin is voting for.
 *                 example: "Atlanta Falcons"
 *     responses:
 *       200:
 *         description: Vote recorded successfully.
 *       400:
 *         description: Missing/invalid fields.
 *       403:
 *         description: Unauthorized - Admin access required.
 *       409:
 *         description: Vote already exists for this match.
 *       500:
 *         description: Server error.
 */
router.post("/vote", adminVoteController.createOrUpsertVote);

/**
 * @swagger
 * /admin/vote/{sportType}/{matchId}:
 *   get:
 *     summary: Get admin vote for a specific match (by sportType and matchId)
 *     tags: [Sports Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sportType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [NFL, NBA, SOCCER, CRICKET, NHL, MLB, UFC]
 *         description: Sport category.
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: Match/Game identifier.
 *     responses:
 *       200:
 *         description: Returns admin vote for the given match.
 *       404:
 *         description: No vote found.
 *       403:
 *         description: Unauthorized - Admin access required.
 *       500:
 *         description: Server error.
 */
router.get("/vote/:sportType/:matchId", adminVoteController.getVote);

/**
 * @swagger
 * /admin/vote/{sportType}/{matchId}:
 *   put:
 *     summary: Update admin vote for a specific match (by sportType and matchId)
 *     tags: [Sports Admin]
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
 *                 example: "22"
 *               selectedTeamName:
 *                 type: string
 *                 example: "Atlanta Falcons"
 *     responses:
 *       200:
 *         description: Vote updated successfully.
 *       404:
 *         description: No vote found to update.
 *       403:
 *         description: Unauthorized - Admin access required.
 *       500:
 *         description: Server error.
 */
router.put("/vote/:sportType/:matchId", adminVoteController.updateVote);

/**
 * @swagger
 * /admin/vote/{sportType}/{matchId}:
 *   delete:
 *     summary: Delete admin vote for a specific match (by sportType and matchId)
 *     tags: [Sports Admin]
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
 *         description: Vote deleted successfully.
 *       404:
 *         description: No vote found to delete.
 *       403:
 *         description: Unauthorized - Admin access required.
 *       500:
 *         description: Server error.
 */
router.delete("/vote/:sportType/:matchId", adminVoteController.deleteVote);

/**
 * @swagger
 * /admin/votes:
 *   get:
 *     summary: List all admin votes (with pagination & filters)
 *     description: Retrieve votes with pagination. Optional filters: sportType, matchId, teamId.
 *     tags: [Sports Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page.
 *       - in: query
 *         name: sportType
 *         schema:
 *           type: string
 *           enum: [NFL, NBA, SOCCER, CRICKET, NHL, MLB, UFC]
 *         description: Filter by sport category.
 *       - in: query
 *         name: matchId
 *         schema:
 *           type: string
 *         description: Filter by exact matchId.
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: string
 *         description: Filter by exact selectedTeamId.
 *     responses:
 *       200:
 *         description: A paginated list of admin votes.
 *       403:
 *         description: Unauthorized - Admin access required.
 *       500:
 *         description: Server error.
 */
router.get("/votes", adminVoteController.listVotes);

module.exports = router;
