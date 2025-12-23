const express = require("express");
const router = express.Router();
const stripeController = require("../controllers/stripeController");
const { authenticate } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Stripe
 *   description: Stripe payment and subscription flows
 */

/**
 * @swagger
 * /stripe/checkout-session:
 *   post:
 *     summary: Create a Stripe Checkout Session for a subscription
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - priceId
 *               - successUrl
 *               - cancelUrl
 *             properties:
 *               priceId:
 *                 type: string
 *                 description: Stripe price identifier mapped to a Subscription plan (subscriptionModel.stripePriceId)
 *               successUrl:
 *                 type: string
 *                 description: URL the user is redirected to after a successful checkout
 *               cancelUrl:
 *                 type: string
 *                 description: URL the user is redirected to if they cancel the checkout
 *     responses:
 *       200:
 *         description: Checkout session created
 *       400:
 *         description: Validation or Stripe error
 */
router.post(
  "/checkout-session",
  authenticate,
  stripeController.createCheckoutSession
);

// Retrieve a checkout session (for verification/testing)
router.get(
  "/checkout-session/:sessionId",
  authenticate,
  stripeController.getCheckoutSession
);

// Basic success/cancel endpoints. Set successUrl/cancelUrl to these or to your frontend.
router.get("/success", stripeController.successPage);
router.get("/cancel", stripeController.cancelPage);

module.exports = router;
