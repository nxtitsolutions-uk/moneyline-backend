const express = require("express");
const router = express.Router();
const reactionController = require("../controllers/reactionController");

/**
 * @swagger
 * tags:
 *   name: Reaction
 *   description: Manage reactions (likes/dislikes) on posts and comments
 */

/**
 * @swagger
 * /reactions/create:
 *   post:
 *     summary: React to a post or comment (like/dislike)
 *     tags: [Reaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *                 description: The ID of the post to react to.
 *                 example: "605c72ef15320734b6a9c3f1"
 *               commentId:
 *                 type: string
 *                 description: The ID of the comment to react to (optional).
 *                 example: "605c72ef15320734b6a9c3f2"
 *               type:
 *                 type: string
 *                 description: The type of reaction (like or dislike).
 *                 enum: [like, dislike]
 *                 example: "like"
 *     responses:
 *       201:
 *         description: Reaction created successfully.
 *       400:
 *         description: Invalid input data.
 *       500:
 *         description: Server error.
 */
router.post("/create", reactionController.createReaction);

module.exports = router;
