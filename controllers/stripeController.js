const stripeService = require("../services/stripeService");

exports.createCheckoutSession = async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    const { session, plan } = await stripeService.createCheckoutSession(
      req.user,
      { priceId, successUrl, cancelUrl }
    );

    return res.status(200).json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      plan: plan.name,
    });
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.handleWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;
  console.log("Webhook received");

  try {
    event = stripeService.constructWebhookEvent(req.body, signature);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await stripeService.handleEvent(event);
    return res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handling error:", error);
    return res.status(500).send("Webhook handler failed");
  }
};

exports.getCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripeService.retrieveCheckoutSession(sessionId);
    return res.status(200).json({ success: true, session });
  } catch (error) {
    console.error("Stripe retrieve session error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.successPage = async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) {
    return res
      .status(400)
      .send("Missing session_id. Ensure successUrl includes ?session_id={CHECKOUT_SESSION_ID}");
  }

  try {
    const session = await stripeService.retrieveCheckoutSession(sessionId);
    // Simple confirmation payload; frontends can replace with their own page.
    return res.status(200).json({
      success: true,
      message: "Checkout successful",
      session: {
        id: session.id,
        status: session.status,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_details?.email,
        subscription: session.subscription,
      },
    });
  } catch (error) {
    console.error("Stripe success page session lookup error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.cancelPage = (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "Checkout canceled. No charges were made.",
  });
};
