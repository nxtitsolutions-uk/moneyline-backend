const mongoose = require('mongoose');
const User = require('./userModel');
const Subscription = require('./subscriptionModel');

const userSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true }, 
  subscriptionStartDate: { type: Date, required: true }, 
  subscriptionExpiryDate: { type: Date, required: true }, 
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  iapReceipt: { type: String },  
  productId: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);
