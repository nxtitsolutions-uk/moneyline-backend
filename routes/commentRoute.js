const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

/**
 * @swagger
 * tags:
 *   name: Comment
 *   description: Manage comments on posts
 */

/**
 * @swagger
 * /comments/create:
 *   post:
 *     summary: Create a new comment on a post
 *     tags: [Comment]
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
 *                 description: The ID of the post to comment on.
 *                 example: "605c72ef15320734b6a9c3f1"
 *               text:
 *                 type: string
 *                 description: The text of the comment.
 *                 example: "This is a great post!"
 *     responses:
 *       201:
 *         description: Comment created successfully.
 *       400:
 *         description: Invalid input data.
 *       500:
 *         description: Server error.
 */
router.post("/create", commentController.createComment);

/**
 * @swagger
 * /comments/get/{postId}:
 *   get:
 *     summary: Get all comments on a specific post
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to fetch comments for.
 *     responses:
 *       200:
 *         description: A list of comments for the post.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Server error.
 */
router.get("/get/:postId", commentController.getAllComments);

/**
 * @swagger
 * /comments/update/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: The updated text content of the comment.
 *                 example: "Updated comment text."
 *     responses:
 *       200:
 *         description: Comment updated successfully.
 *       400:
 *         description: Invalid data.
 *       404:
 *         description: Comment not found.
 *       500:
 *         description: Server error.
 */
router.put("/update/:id", commentController.updateComment);

/**
 * @swagger
 * /comments/delete/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to delete.
 *     responses:
 *       200:
 *         description: Comment deleted successfully.
 *       404:
 *         description: Comment not found.
 *       500:
 *         description: Server error.
 */
router.delete("/delete/:id", commentController.deleteComment);

module.exports = router;
