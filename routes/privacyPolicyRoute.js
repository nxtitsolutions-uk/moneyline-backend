const express = require("express");
const router = express.Router();
const privacyPolicyController = require("../controllers/privacyPolicyController");
const { authenticate, restrictTo } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: PrivacyPolicy
 *   description: Privacy policy management
 */

/**
 * @swagger
 * /privacy-policy:
 *   get:
 *     summary: Fetch the latest privacy policy
 *     tags: [PrivacyPolicy]
 *     responses:
 *       200:
 *         description: Privacy policy fetched successfully
 */
router.get('/', privacyPolicyController.getPrivacyPolicy);

/**
 * @swagger
 * /privacy-policy:
 *   post:
 *     summary: Create a new privacy policy
 *     tags: [PrivacyPolicy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Privacy policy content
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 example: "<p>Your privacy matters to us...</p>"
 *     responses:
 *       200:
 *         description: Policy created successfully
 */
router.post(
  '/',
  authenticate,
  restrictTo("admin"),
  privacyPolicyController.createPrivacyPolicy
);

/**
 * @swagger
 * /privacy-policy/{id}:
 *   patch:
 *     summary: Update an existing privacy policy
 *     tags: [PrivacyPolicy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Policy ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "<p>Updated privacy statement</p>"
 *     responses:
 *       200:
 *         description: Policy updated
 */
router.patch(
  '/:id',
  authenticate,
  restrictTo("admin"),
  privacyPolicyController.updatePrivacyPolicy
);

/**
 * @swagger
 * /privacy-policy/{id}:
 *   delete:
 *     summary: Delete a privacy policy by ID
 *     tags: [PrivacyPolicy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Policy ID to delete
 *     responses:
 *       200:
 *         description: Policy deleted
 */
router.delete(
  '/:id',
  authenticate,
  restrictTo("admin"),
  privacyPolicyController.deletePrivacyPolicy
);

module.exports = router;
