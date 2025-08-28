const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const validate = require('../middlewares/validate');          
const V = require('../validators/profileValidator'); 
const {authenticate} = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Profile management APIs
 */

/**
 * @swagger
 * /profile/create:
 *   post:
 *     summary: Create user profile (all fields in one API)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, username]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               username:
 *                 type: string
 *                 example: john_doe
 *               profilePicture:
 *                 type: string
 *                 example: https://cdn.moneyline.com/profiles/johndoe.jpg
 *               favoriteSports:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["NBA", "Cricket"]
 *               favoriteTeams:
 *                 type: object
 *                 example:
 *                   Cricket: ["India", "Pakistan"]
 *                   NBA: ["Lakers", "Celtics"]
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Username taken or profile already exists
 *       500:
 *         description: Failed to create profile
 */
router.post('/create',authenticate, V.create, validate, profileController.createProfile);

/**
 * @swagger
 * /profile/update:
 *   put:
 *     summary: Update user profile (any field)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *               favoriteSports:
 *                 type: array
 *                 items:
 *                   type: string
 *               favoriteTeams:
 *                 type: object
 *                 example:
 *                   Cricket: ["India", "Pakistan"]
 *                   NBA: ["Lakers", "Celtics"]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Failed to update profile
 */
router.put('/update',authenticate, V.update, validate, profileController.updateProfile);

/**
 * @swagger
 * /profile/get:
 *   get:
 *     summary: Get authenticated user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Failed to fetch profile
 */
router.get('/get',authenticate, profileController.getProfile);

/**
 * @swagger
 * /profile/delete:
 *   delete:
 *     summary: Delete authenticated user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       500:
 *         description: Failed to delete profile
 */
router.delete('/delete',authenticate, profileController.deleteProfile);

/**
 * @swagger
 * /profile/check-username:
 *   get:
 *     summary: Check if a username is available
 *     tags: [Profile]
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username to check
 *     responses:
 *       200:
 *         description: Returns whether the username is available
 *       400:
 *         description: Username not provided
 *       500:
 *         description: Failed to check username availability
 */
router.get('/check-username', profileController.checkUsername);


module.exports = router;

