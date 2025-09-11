const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Feedback = require('../models/feedbackModel'); // Adjust the path to your Feedback model

dotenv.config({ path: './config.env' }); // Ensure your environment file is set

const userId = '6886289d232c137eb1aab529'; // Hardcoded user ID

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI) // Using MONGO_URI from your .env file
  .then(() => {
    console.log('✅ MongoDB connected');
    return seedFeedback();
  })
  .catch(err => console.error('❌ MongoDB connection failed:', err));

async function seedFeedback() {
  try {
    // Remove existing data from the Feedback collection before inserting new data
    await Feedback.deleteMany();

    // Insert dummy feedback data
    await Feedback.insertMany([
      {
        user: userId, // Use the hardcoded user ID
        message: 'This is the first feedback message.',
        isResolved: false,
      }
    ]);

    console.log('✅ Feedback data seeded successfully!');
    process.exit(); // Exit the process after seeding
  } catch (err) {
    console.error('❌ Error seeding feedback:', err);
    process.exit(1);
  }
}
