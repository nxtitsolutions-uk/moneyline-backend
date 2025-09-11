const express = require("express");
const router = express.Router();
const { authenticate, restrictTo } = require("../middlewares/authMiddleware");
const feedbackController = require("../controllers/feedbackController");

/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: Feedback management
 */

/**
 * @swagger
 * /feedback:
 *   post:
 *     summary: Submit feedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Feedback submitted
 *       400:
 *         description: Message required
 */
router.post("/", authenticate, feedbackController.submitFeedback);

/**
 * @swagger
 * /feedback:
 *   get:
 *     summary: Get all feedbacks (admin only)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of feedbacks
 */
router.get("/", authenticate, restrictTo("admin"), feedbackController.getAllFeedbacks);

/**
 * @swagger
 * /feedback/{id}/resolve:
 *   patch:
 *     summary: Mark feedback as resolved (admin only)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feedback marked as resolved
 *       404:
 *         description: Feedback not found
 */
router.patch("/:id/resolve", authenticate, restrictTo("admin"), feedbackController.resolveFeedback);

module.exports = router;
