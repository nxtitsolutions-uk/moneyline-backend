const User = require("../models/userModel");
const SubscriptionPlan = require("../models/subscriptionModel");
const UserSubscription = require("../models/userSubscriptionModel");
const validateAndroidPurchase = require("../utils/validateAndroidPurchase");
const validateIOSPurchase = require("../utils/validateIOSPurchase");
const { calculateExpiryDate } = require("../utils/helpers"); // Move helper function to utils for better reusability

// CRUD Operations

// 1. Create a new subscription plan
exports.createSubscriptionPlan = async (req, res) => {
  try {
    const { name, price, features, duration, productId } = req.body;
    const newPlan = new SubscriptionPlan({
      name,
      price,
      features,
      duration,
      productId,
    });
    await newPlan.save();
    return res.status(201).json({
      message: "Subscription plan created successfully",
      subscriptionPlan: newPlan,
    });
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    return res
      .status(500)
      .json({ message: "Server error creating subscription plan." });
  }
};

// 2. Get all subscription plans
exports.getAllSubscriptionPlans = async (req, res) => {
  try {
    const subscriptionPlans = await SubscriptionPlan.find();
    return res.status(200).json({
      success: true,
      subscriptionPlans,
    });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return res
      .status(500)
      .json({ message: "Server error fetching subscription plans." });
  }
};

// 3. Handle subscription purchase (Android/iOS)
exports.handlePurchase = async (req, res) => {
  try {
    const { deviceType, purchaseData } = req.body;
    console.log(
      "===========deviceType==============",
      deviceType,
      purchaseData
    );

    const userId = req.user._id;

    if (!deviceType || !purchaseData) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    let receipt, productId, originalTransactionId;

    if (deviceType === "android") {
      receipt = await validateAndroidPurchase(purchaseData);
      console.log("===========android receipt=========", receipt);
      productId = purchaseData.productId;
    } else if (deviceType === "ios") {
      receipt = await validateIOSPurchase(purchaseData);
      const latestReceipt =
        receipt.latest_receipt_info?.[0] || receipt.receipt?.in_app?.[0];
      productId = latestReceipt?.product_id;
      originalTransactionId = latestReceipt?.original_transaction_id;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Unsupported device type" });
    }

    const plan = await SubscriptionPlan.findOne({ productId: productId });
    if (!plan)
      return res.status(404).json({
        success: false,
        message: "No matching subscription plan found",
      });

    // Calculate expiry date based on plan duration
    const startDate = new Date();
    const expiryDate = calculateExpiryDate(startDate, plan.duration);

    // Create a new subscription record
    const subscriptionPayload = {
      userId,
      planId: plan._id,
      platform: deviceType,
      productId,
      purchaseToken:
        deviceType === "android" ? purchaseData.purchaseToken : null,
      originalTransactionId: originalTransactionId || null,
      isActive: true,
      startDate,
      expiryDate,
      lastValidatedAt: new Date(),
    };

    const subscription = await UserSubscription.create(subscriptionPayload);

    // Optionally, mark previous subscriptions inactive (if you want only one active subscription)
    await UserSubscription.updateMany(
      { userId, _id: { $ne: subscription._id } },
      { isActive: false }
    );

    // Update user’s current subscription info to reflect latest purchase
    user.subscriptionExpiryDate = expiryDate;
    user.deviceType = deviceType;
    user.isSubscribed = true;

    await user.save();
    const updatedUser = await User.findById(userId);

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Subscription verified successfully",
      data: {
        user: updatedUser,
        plan: plan.name,
        expires: expiryDate,
        platform: deviceType,
      },
    });
  } catch (error) {
    console.error("Subscription error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to validate purchase",
      error: error.message,
    });
  }
};

// 4. Update a subscription plan (if needed)
exports.updateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedPlan) {
      return res.status(404).json({ message: "Subscription plan not found." });
    }

    return res.status(200).json({
      message: "Subscription plan updated successfully",
      subscriptionPlan: updatedPlan,
    });
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    return res
      .status(500)
      .json({ message: "Server error updating subscription plan." });
  }
};

// 5. Delete a subscription plan
exports.deleteSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPlan = await SubscriptionPlan.findByIdAndDelete(id);

    if (!deletedPlan) {
      return res.status(404).json({ message: "Subscription plan not found." });
    }

    return res.status(200).json({
      message: "Subscription plan deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subscription plan:", error);
    return res
      .status(500)
      .json({ message: "Server error deleting subscription plan." });
  }
};
