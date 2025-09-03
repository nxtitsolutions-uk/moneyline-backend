const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const { authenticate, restrictTo } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: Subscription management and plan operations
 */

/**
 * @swagger
 * /subscription/create:
 *   post:
 *     summary: Create a new subscription plan
 *     tags: [Subscription]
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
 *               price:
 *                 type: string
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               duration:
 *                 type: string
 *               productId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subscription plan created successfully
 *       500:
 *         description: Server error
 */
router.post("/create", authenticate, restrictTo("admin"), subscriptionController.createSubscriptionPlan);

/**
 * @swagger
 * /subscription/{id}:
 *   patch:
 *     summary: Update an existing subscription plan
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the subscription plan to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: string
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               duration:
 *                 type: string
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscription plan updated successfully
 *       404:
 *         description: Subscription plan not found
 *       500:
 *         description: Server error
 */
router.patch("/:id", authenticate, restrictTo("admin"), subscriptionController.updateSubscriptionPlan);

/**
 * @swagger
 * /subscription/{id}:
 *   delete:
 *     summary: Delete an existing subscription plan
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the subscription plan to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription plan deleted successfully
 *       404:
 *         description: Subscription plan not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authenticate, restrictTo("admin"), subscriptionController.deleteSubscriptionPlan);

/**
 * @swagger
 * /subscription:
 *   get:
 *     summary: Get all subscription plans
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of subscription plans
 *       500:
 *         description: Server error
 */
router.get("/", authenticate, subscriptionController.getAllSubscriptionPlans);

/**
 * @swagger
 * /user/subscribe:
 *   post:
 *     summary: Subscribe a user to a subscription plan
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               plan_id:
 *                 type: string
 *               receipt:
 *                 type: string
 *     responses:
 *       200:
 *         description: User subscribed successfully
 *       400:
 *         description: Invalid product ID or verification failure
 *       500:
 *         description: Server error
 */
router.post("/subscribe", authenticate, subscriptionController.handlePurchase);

module.exports = router;
