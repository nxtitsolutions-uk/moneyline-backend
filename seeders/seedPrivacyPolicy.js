const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PrivacyPolicy = require('../models/privacyPolicyModel'); // Adjust the path to your PrivacyPolicy model
const User = require('../models/userModel'); // Adjust the path to your User model

dotenv.config({ path: './config.env' }); // Ensure your environment file is set

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI) // Using MONGO_URI from your .env file
  .then(() => {
    console.log('✅ MongoDB connected');
    return seedPrivacyPolicies();
  })
  .catch(err => console.error('❌ MongoDB connection failed:', err));

async function seedPrivacyPolicies() {
  try {
    // Remove existing data from the PrivacyPolicy collection before inserting new data
    await PrivacyPolicy.deleteMany();

    // Find a user to associate with the privacy policies
    const user = await User.findOne(); // Get the first user from the User collection (or choose one based on your need)
    if (!user) {
      console.error('❌ No users found in the database. Please add a user first.');
      process.exit(1);
    }
    const userId = '6886289d232c137eb1aab529';
    // Insert dummy data into the PrivacyPolicy collection
    await PrivacyPolicy.insertMany([
      {
        content: 'This is the privacy policy content for version 1.0.',
        user: userId, // Linking the first user from the database
      },
      {
        content: 'Updated privacy policy content for version 1.1.',
        user: userId, // Linking the same user
      },
      {
        content: 'Privacy policy for version 2.0, with additional details.',
        user:userId, // Linking the same user
      }
    ]);

    console.log('✅ Privacy policies seeded successfully!');
    process.exit(); // Exit the process after seeding
  } catch (err) {
    console.error('❌ Error seeding Privacy Policies:', err);
    process.exit(1);
  }
}
