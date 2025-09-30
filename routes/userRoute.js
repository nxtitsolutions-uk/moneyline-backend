const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { authenticate, restrictTo } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management and account operations
 */

/**
 * @swagger
 * /user/update-password:
 *   patch:
 *     summary: Update the authenticated user's password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: oldPass123
 *               newPassword:
 *                 type: string
 *                 example: newSecurePass456
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Incorrect old password
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch("/update-password", authenticate, userController.updatePassword);

/**
 * @swagger
 * /user/{id}:
 *   patch:
 *     summary: Update user profile (admin only or self-update logic in controller)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               googleId:
 *                 type: string
 *               appleId:
 *                 type: string
 *               subscriptionType:
 *                 type: string
 *                 enum: [free, basic, premium]
 *               provider:
 *                 type: string
 *                 enum: [email, google, apple]
 *               isNotification:
 *                 type: boolean
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Conflict or bad input
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id",
  authenticate,
  restrictTo("admin"),
  userController.updateUser
);

/**
 * @swagger
 * /user/coins:
 *   get:
 *     summary: Get the current user's coin balance
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coin balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 coins:
 *                   type: number
 *                   example: 20
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error fetching coins
 */
router.get("/coins", userController.getUserCoins);

router.get("/list", userController.getAllUsers);

router.patch("/block/:id", authenticate, userController.blockUser);

router.post("/delete-user/:id", authenticate, userController.deleteUser);

router.post("/recover-user/:id", authenticate, userController.recoverUser);

module.exports = router;
