const express = require("express");
const router = express.Router();

const termsController = require("../controllers/termsAndConditionsController");
const { authenticate, restrictTo } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: TermsAndConditions
 *   description: Manage Terms & Conditions per language
 */

/**
 * @swagger
 * /terms-and-conditions:
 *   get:
 *     summary: Get the latest terms and conditions based on language
 *     tags: [TermsAndConditions]
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         required: false
 *         schema:
 *           type: string
 *           example: en
 *         description: Language code (default is 'en')
 *     responses:
 *       200:
 *         description: Terms fetched successfully
 *       404:
 *         description: No terms found
 *       500:
 *         description: Server error
 */
router.get("/", termsController.getLatestTermsAndConditions);

/**
 * @swagger
 * /terms-and-conditions:
 *   post:
 *     summary: Create new terms and conditions (admin only)
 *     tags: [TermsAndConditions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [version, content]
 *             properties:
 *               version:
 *                 type: string
 *                 example: "1.1"
 *               content:
 *                 type: string
 *                 example: "<p>Latest terms and conditions content...</p>"
 *     responses:
 *       201:
 *         description: Terms created successfully
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authenticate,
  restrictTo("admin"),
  termsController.createTermsAndConditions
);

module.exports = router;
