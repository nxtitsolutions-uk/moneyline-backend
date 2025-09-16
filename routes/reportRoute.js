const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

/**
 * @swagger
 * tags:
 *   name: Report
 *   description: Manage reports for inappropriate content
 */

/**
 * @swagger
 * /reports/create:
 *   post:
 *     summary: Report a post for inappropriate content
 *     tags: [Report]
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
 *                 description: The ID of the post being reported.
 *                 example: "605c72ef15320734b6a9c3f1"
 *               reason:
 *                 type: string
 *                 description: The reason for reporting.
 *                 example: "Inappropriate Content"
 *     responses:
 *       201:
 *         description: Post reported successfully.
 *       400:
 *         description: Invalid data.
 *       500:
 *         description: Server error.
 */
router.post("/create", reportController.createReport);

module.exports = router;
