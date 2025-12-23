const mongoose = require("mongoose");
const SubscriptionPlan = require("../models/subscriptionModel");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

// Stripe product/price IDs for test mode
const STRIPE_PRODUCT_ID = "prod_TenbgWSRfOtxbl"; // Stripe product ID (from Dashboard)
const STRIPE_PRICE_ID = "price_1ShU04HQRbdcS4oQqPaLY54x"; // REQUIRED: Stripe price ID (price_xxx)

if (!STRIPE_PRICE_ID) {
  console.error("SEED_STRIPE_PRICE_ID is required (your Stripe price_xxx).");
  process.exit(1);
}

const plan = {
  name: "Stripe Pro Plan",
  price: "10", // display price (string to match schema)
  features: [
    "Full access to content",
    "Priority support",
    "Exclusive features",
  ],
  duration: "monthly",
  // productId kept for internal reference; stripePriceId is what Checkout expects
  productId: STRIPE_PRODUCT_ID,
  stripePriceId: STRIPE_PRICE_ID,
};

const seedStripePlan = async () => {
  try {
    await SubscriptionPlan.findOneAndUpdate(
      { productId: STRIPE_PRODUCT_ID },
      plan,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log("Seeded Stripe plan with productId:", STRIPE_PRODUCT_ID);
    console.log("stripePriceId:", STRIPE_PRICE_ID);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding Stripe plan:", error);
    process.exit(1);
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
    await seedStripePlan();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

connectDB();
