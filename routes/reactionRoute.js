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

/**
 * @swagger
 * /reactions/get:
 *   get:
 *     summary: Get all reactions (optional filter by postId or commentId)
 *     tags: [Reaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *         description: Filter reactions by post ID.
 *       - in: query
 *         name: commentId
 *         schema:
 *           type: string
 *         description: Filter reactions by comment ID.
 *     responses:
 *       200:
 *         description: A list of reactions.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Server error.
 */
router.get("/get", reactionController.getAllReactions);

/**
 * @swagger
 * /reactions/get/{id}:
 *   get:
 *     summary: Get a reaction by ID
 *     tags: [Reaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the reaction.
 *     responses:
 *       200:
 *         description: Reaction retrieved successfully.
 *       404:
 *         description: Reaction not found.
 *       500:
 *         description: Server error.
 */
router.get("/get/:id", reactionController.getReactionById);

/**
 * @swagger
 * /reactions/update/{id}:
 *   put:
 *     summary: Update a reaction
 *     tags: [Reaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the reaction.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [like, dislike]
 *                 description: Updated reaction type.
 *                 example: "dislike"
 *     responses:
 *       200:
 *         description: Reaction updated successfully.
 *       403:
 *         description: Unauthorized - you cannot update this reaction.
 *       404:
 *         description: Reaction not found.
 *       500:
 *         description: Failed to update reaction.
 */
router.put("/update/:id", reactionController.updateReaction);

/**
 * @swagger
 * /reactions/delete/{id}:
 *   delete:
 *     summary: Delete a reaction
 *     tags: [Reaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the reaction.
 *     responses:
 *       200:
 *         description: Reaction deleted successfully.
 *       403:
 *         description: Unauthorized - you cannot delete this reaction.
 *       404:
 *         description: Reaction not found.
 *       500:
 *         description: Failed to delete reaction.
 */
router.delete("/delete/:id", reactionController.deleteReaction);

module.exports = router;
