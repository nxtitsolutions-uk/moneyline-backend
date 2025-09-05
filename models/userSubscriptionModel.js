const mongoose = require('mongoose');
const User = require('./userModel');
const Subscription = require('./subscriptionModel');

const userSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
  productId: { type: String, required: true },
  platform: { type: String, enum: ['android', 'ios'], required: true },
  subscriptionStartDate: { type: Date, required: true },
  subscriptionExpiryDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  isActive: { type: Boolean, default: true },
  iapReceipt: { type: String }, // iOS receipt data
  purchaseToken: { type: String }, // Android purchase token
  originalTransactionId: { type: String }, // iOS original transaction id
  lastValidatedAt: { type: Date }, // Last time the subscription was validated
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);