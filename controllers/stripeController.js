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
    const wantsJson = req.query.format === "json";
    if (wantsJson) {
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
    }

    const amount = session.amount_total
      ? (session.amount_total / 100).toFixed(2)
      : "0.00";
    const currency = (session.currency || "").toUpperCase();
    const email = session.customer_details?.email || "Your email";

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Payment Successful</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f7f9fb; color: #0f172a; margin: 0; padding: 0; }
            .wrap { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 12px 30px rgba(0,0,0,0.08); overflow: hidden; }
            .hero { padding: 28px; background: linear-gradient(135deg, #0ea5e9, #2563eb); color: #fff; }
            .hero h1 { margin: 0 0 8px; font-size: 24px; }
            .hero p { margin: 0; opacity: 0.9; }
            .content { padding: 24px 28px 32px; }
            .row { display: flex; justify-content: space-between; margin: 10px 0; font-size: 15px; }
            .row strong { color: #0f172a; }
            .badge { display: inline-block; padding: 6px 10px; border-radius: 999px; background: #e0f2fe; color: #0369a1; font-size: 12px; font-weight: 600; letter-spacing: 0.02em; }
            .footer { padding: 18px 28px 26px; background: #f8fafc; font-size: 13px; color: #475569; }
            a.button { display: inline-block; padding: 12px 16px; margin-top: 14px; background: #0ea5e9; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="hero">
              <div class="badge">Payment confirmed</div>
              <h1>Thank you!</h1>
              <p>Your subscription is now active.</p>
            </div>
            <div class="content">
              <div class="row"><span>Session</span><strong>${session.id}</strong></div>
              <div class="row"><span>Status</span><strong>${session.status}</strong></div>
              <div class="row"><span>Amount</span><strong>${amount} ${currency}</strong></div>
              <div class="row"><span>Email</span><strong>${email}</strong></div>
              <div class="row"><span>Subscription</span><strong>${session.subscription || "N/A"}</strong></div>
              <a class="button" href="/">Return to app</a>
            </div>
            <div class="footer">
              Need help? Contact support with your session ID above.
            </div>
          </div>
        </body>
      </html>
    `;
    return res.status(200).send(html);
  } catch (error) {
    console.error("Stripe success page session lookup error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.cancelPage = (req, res) => {
  const wantsJson = req.query.format === "json";
  if (wantsJson) {
    return res.status(200).json({
      success: true,
      message: "Checkout canceled. No charges were made.",
    });
  }

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Payment Canceled</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f7f9fb; color: #0f172a; margin: 0; padding: 0; }
          .wrap { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 12px 30px rgba(0,0,0,0.08); overflow: hidden; }
          .hero { padding: 28px; background: linear-gradient(135deg, #f97316, #f43f5e); color: #fff; }
          .hero h1 { margin: 0 0 8px; font-size: 24px; }
          .hero p { margin: 0; opacity: 0.9; }
          .content { padding: 24px 28px 32px; font-size: 15px; }
          .footer { padding: 18px 28px 26px; background: #f8fafc; font-size: 13px; color: #475569; }
          a.button { display: inline-block; padding: 12px 16px; margin-top: 14px; background: #0ea5e9; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="hero">
            <h1>Payment canceled</h1>
            <p>No charges were made.</p>
          </div>
          <div class="content">
            You can restart checkout at any time from the app.
            <a class="button" href="/">Return to app</a>
          </div>
          <div class="footer">
            If this was a mistake, please try again or contact support.
          </div>
        </div>
      </body>
    </html>
  `;
  return res.status(200).send(html);
};
