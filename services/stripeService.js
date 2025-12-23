const Stripe = require("stripe");
const User = require("../models/userModel");
const SubscriptionPlan = require("../models/subscriptionModel");
const UserSubscription = require("../models/userSubscriptionModel");
const logger = require("../utils/logger");

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not configured");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20",
});

// Ensure success URLs carry the Stripe session placeholder so we can look it up after redirect
const ensureSessionPlaceholder = (url) => {
  const placeholder = "{CHECKOUT_SESSION_ID}";
  if (!url) return url;
  if (url.includes("session_id=")) return url; // assume caller already provided it
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("session_id", placeholder);
    return parsed.toString();
  } catch (_err) {
    // Fallback if URL parsing fails; append query string manually
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}session_id=${placeholder}`;
  }
};

const isActiveStatus = (status) =>
  ["active", "trialing", "past_due"].includes(status);

const mapStripeStatus = (status) => {
  if (["active", "trialing", "past_due"].includes(status)) return "active";
  if (["canceled", "incomplete_expired"].includes(status)) return "cancelled";
  return "expired";
};

const ensureStripeCustomer = async (user) => {
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { userId: user._id.toString() },
  });

  user.stripeCustomerId = customer.id;
  await user.save({ validateBeforeSave: false });
  return customer.id;
};

const createCheckoutSession = async (user, payload) => {
  const { priceId, successUrl, cancelUrl } = payload;

  if (!priceId || !successUrl || !cancelUrl) {
    throw new Error("priceId, successUrl and cancelUrl are required");
  }

  const plan = await SubscriptionPlan.findOne({ stripePriceId: priceId });
  console.log("Plan found:", plan);
  if (!plan) {
    throw new Error("No subscription plan is linked to the provided priceId");
  }

  const customerId = await ensureStripeCustomer(user);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user._id.toString(),
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: ensureSessionPlaceholder(successUrl),
    cancel_url: cancelUrl,
    metadata: {
      userId: user._id.toString(),
      subscriptionPlanId: plan._id.toString(),
      priceId,
    },
    subscription_data: {
      metadata: {
        userId: user._id.toString(),
        subscriptionPlanId: plan._id.toString(),
        priceId,
      },
    },
  });

  return { session, plan };
};

const upsertUserSubscriptionFromStripe = async ({
  userId,
  plan,
  stripeSubscription,
  priceId,
}) => {
  const subscriptionExpiryDate = stripeSubscription.current_period_end
    ? new Date(stripeSubscription.current_period_end * 1000)
    : null;
  const subscriptionStartDate = stripeSubscription.current_period_start
    ? new Date(stripeSubscription.current_period_start * 1000)
    : new Date();

  const doc = await UserSubscription.findOneAndUpdate(
    { userId, stripeSubscriptionId: stripeSubscription.id },
    {
      userId,
      subscriptionId: plan?._id,
      productId: plan?.productId || priceId,
      platform: "stripe",
      subscriptionStartDate,
      subscriptionExpiryDate,
      status: mapStripeStatus(stripeSubscription.status),
      isActive: isActiveStatus(stripeSubscription.status),
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: priceId,
      lastValidatedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await UserSubscription.updateMany(
    { userId, _id: { $ne: doc._id } },
    { isActive: false }
  );

  const user = await User.findById(userId);
  if (user) {
    user.isSubscribed = isActiveStatus(stripeSubscription.status);
    if (plan?.name) {
      user.subscriptionType = plan.name;
    }
    user.subscriptionExpiryDate = subscriptionExpiryDate;
    user.stripeCustomerId = stripeSubscription.customer;
    user.stripeSubscriptionId = stripeSubscription.id;
    await user.save({ validateBeforeSave: false });
  }

  return doc;
};

const resolveUserAndPlan = async (stripeSubscription, fallbackPriceId) => {
  const metadataUserId =
    stripeSubscription.metadata?.userId ||
    stripeSubscription.metadata?.userid ||
    stripeSubscription.metadata?.user_id;

  const priceId =
    stripeSubscription.items?.data?.[0]?.price?.id || fallbackPriceId;

  const plan = priceId
    ? await SubscriptionPlan.findOne({ stripePriceId: priceId })
    : null;

  return { userId: metadataUserId, plan, priceId };
};

const handleCheckoutSessionCompleted = async (session) => {
  const userId = session.client_reference_id || session.metadata?.userId;
  if (!userId || !session.subscription) {
    logger.warn("Stripe checkout session missing user or subscription link", {
      sessionId: session.id,
    });
    return;
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(
    session.subscription,
    { expand: ["items.data.price"] }
  );

  const { plan, priceId } = await resolveUserAndPlan(
    stripeSubscription,
    session.metadata?.priceId
  );

  await upsertUserSubscriptionFromStripe({
    userId,
    plan,
    stripeSubscription,
    priceId,
  });
};

const handleSubscriptionUpdate = async (subscription) => {
  const { userId, plan, priceId } = await resolveUserAndPlan(
    subscription,
    subscription.items?.data?.[0]?.price?.id
  );

  if (!userId) {
    logger.warn("Stripe subscription update missing user metadata", {
      subscriptionId: subscription.id,
    });
    return;
  }

  await upsertUserSubscriptionFromStripe({
    userId,
    plan,
    stripeSubscription: subscription,
    priceId,
  });
};

const constructWebhookEvent = (payload, signature) => {
  if (!stripeWebhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  return stripe.webhooks.constructEvent(payload, signature, stripeWebhookSecret);
};

const handleEvent = async (event) => {
  try {
    switch (event.type) {
      /**
       * User completed Stripe Checkout (subscription created)
       */
      case "checkout.session.completed": {
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      }

      /**
       * Canonical recurring payment success event
       * (DO NOT use invoice_payment.paid)
       */
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;

        if (!invoice.subscription) {
          logger.warn("Invoice payment succeeded without subscription", {
            invoiceId: invoice.id,
          });
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription,
          { expand: ["items.data.price"] }
        );

        await handleSubscriptionUpdate(subscription);
        break;
      }

      /**
       * Payment failed (card declined, insufficient funds, etc)
       */
      case "invoice.payment_failed": {
        const invoice = event.data.object;

        logger.warn("Stripe invoice payment failed", {
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription,
          customerId: invoice.customer,
        });

        // Optional: mark subscription as past_due / notify user
        break;
      }

      /**
       * Subscription lifecycle events
       */
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await handleSubscriptionUpdate(event.data.object);
        break;
      }

      /**
       * Ignore all other Stripe noise safely
       */
      default: {
        logger.info(`Unhandled Stripe event type ${event.type}`);
        break;
      }
    }
  } catch (error) {
    logger.error("Stripe webhook event handling failed", {
      eventType: event.type,
      error: error.message,
    });

    // IMPORTANT: rethrow so controller returns 500
    // Stripe will retry only if something actually failed
    throw error;
  }
};


const retrieveCheckoutSession = async (sessionId) => {
  if (!sessionId) throw new Error("sessionId is required");
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "subscription"],
  });
};

module.exports = {
  createCheckoutSession,
  constructWebhookEvent,
  handleEvent,
  retrieveCheckoutSession,
};
