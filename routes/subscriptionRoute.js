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
router.post(
  "/create",
  authenticate,
  restrictTo("admin"),
  subscriptionController.createSubscriptionPlan
);

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
router.patch(
  "/:id",
  authenticate,
  restrictTo("admin"),
  subscriptionController.updateSubscriptionPlan
);

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
router.delete(
  "/:id",
  authenticate,
  restrictTo("admin"),
  subscriptionController.deleteSubscriptionPlan
);

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
 * /subscription/subscribe:
 *   post:
 *     summary: Verify a mobile purchase and activate a subscription
 *     description: >
 *       Validates an Android or iOS purchase and creates/updates the user's active subscription.
 *       Provide *deviceType* as "android" or "ios" and the corresponding *purchaseData* payload.
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [deviceType, purchaseData]
 *                 properties:
 *                   deviceType:
 *                     type: string
 *                     enum: [android]
 *                   purchaseData:
 *                     type: object
 *                     required: [productId, purchaseToken]
 *                     properties:
 *                       productId:
 *                         type: string
 *                         description: Play Billing product ID (must match a SubscriptionPlan.productId)
 *                         example: com.myapp.pro.monthly
 *                       purchaseToken:
 *                         type: string
 *                         description: Play Billing purchase token
 *                         example: abcdefg.hijklmnop.qrstuv
 *                       orderId:
 *                         type: string
 *                         description: (Optional) Google order ID
 *                         example: GPA.1234-5678-9012-34567
 *               - type: object
 *                 required: [deviceType, purchaseData]
 *                 properties:
 *                   deviceType:
 *                     type: string
 *                     enum: [ios]
 *                   purchaseData:
 *                     type: object
 *                     required: [receiptData]
 *                     properties:
 *                       receiptData:
 *                         type: string
 *                         description: Base64-encoded App Store receipt
 *                         example: MIIX2QYJKoZIhvcNAQcCoIIXyjCCF8YCAQExCzAJBgUrDgMCGgUAM...
 *           examples:
 *             android:
 *               summary: Android example
 *               value:
 *                 deviceType: android
 *                 purchaseData:
 *                   productId: com.myapp.pro.monthly
 *                   purchaseToken: abcdefg.hijklmnop.qrstuv
 *                   orderId: GPA.1234-5678-9012-34567
 *             ios:
 *               summary: iOS example
 *               value:
 *                 deviceType: ios
 *                 purchaseData:
 *                   receiptData: MIIX2QYJKoZIhvcNAQcCoIIXyjCCF8YCAQExCzAJBgUrDgMCGgUAM...
 *     responses:
 *       200:
 *         description: Subscription verified and activated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Subscription verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: Updated user document
 *                     plan:
 *                       type: string
 *                       description: Subscription plan name
 *                       example: Pro Monthly
 *                     expires:
 *                       type: string
 *                       format: date-time
 *                       description: Subscription expiry date
 *                     platform:
 *                       type: string
 *                       enum: [android, ios]
 *                       example: android
 *       400:
 *         description: Bad request (missing fields or unsupported device type)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Missing required fields
 *       404:
 *         description: User or matching subscription plan not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No matching subscription plan found
 *       500:
 *         description: Server error while validating purchase
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to validate purchase
 *                 error:
 *                   type: string
 *                   example: Validation service timeout
 */
router.post("/subscribe", authenticate, subscriptionController.handlePurchase);

module.exports = router;
