// routes/notificationSettingsRoutes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const notificationSettingsController = require('../controllers/notificationController');

/**
 * @swagger
 * tags:
 *   name: Notification Settings
 *   description: User notification settings APIs
 */

/**
 * @swagger
 * /notification/update:
 *   post:
 *     summary: Update notification settings for the authenticated user
 *     tags: [Notification Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferences:
 *                 type: object
 *                 required:
 *                   - game_reminders
 *                   - voting_updates
 *                 properties:
 *                   game_reminders:
 *                     type: boolean
 *                     description: Enable or disable game reminders
 *                   voting_updates:
 *                     type: boolean
 *                     description: Enable or disable voting updates
 *     responses:
 *       200:
 *         description: Notification settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     preferences:
 *                       type: object
 *                       properties:
 *                         game_reminders:
 *                           type: boolean
 *                         voting_updates:
 *                           type: boolean
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       400:
 *         description: Invalid data provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Failed to update notification settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post(
  '/update',
  [
    body('preferences').isObject().withMessage('Preferences must be an object'),  // Validate that preferences is an object
    body('preferences.game_reminders').isBoolean().optional().withMessage('game_reminders must be a boolean'),
    body('preferences.voting_updates').isBoolean().optional().withMessage('voting_updates must be a boolean')
  ],
  notificationSettingsController.updateNotificationSettings
);

module.exports = router;
