const mongoose = require('mongoose');
const SubscriptionPlan = require('../models/subscriptionModel');
require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;

// Predefined subscription plans (Free and Premium)
const subscriptionPlans = [
  {
    name: 'Free Plan',
    price: '0',
    features: ['Basic features', 'Limited access to content'],
    duration: 'monthly', 
    productId: 'com.app.free_plan', 
  },
  {
    name: 'Premium Plan',
    price: '25',
    features: ['Full access to all content', 'Priority support', 'Exclusive features'],
    duration: 'monthly', 
    productId: 'com.app.premium_plan', 
  },
];

// Seeder function to insert subscription plans into the database
const seedSubscriptionPlans = async () => {
  try {
    // Clear the collection before seeding (optional)
    await SubscriptionPlan.deleteMany({});

    // Insert the subscription plans into the database
    const insertedPlans = await SubscriptionPlan.insertMany(subscriptionPlans);

    console.log('Successfully seeded subscription plans:', insertedPlans);
    process.exit(0); // Exit the process after seeding
  } catch (error) {
    console.error('Error seeding subscription plans:', error);
    process.exit(1); // Exit with error code on failure
  }
};

// Connect to MongoDB and run the seeder
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    await seedSubscriptionPlans(); // Run the seeder after DB connection
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit with error code on failure
  }
};

// Run the script
connectDB();
