const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AboutApp = require('../models/aboutAppModel'); // Adjust the path to your AboutApp model

dotenv.config({ path: './config.env' }); // Ensure your environment file is set

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI) // Using MONGO_URI from your .env file
  .then(() => {
    console.log('✅ MongoDB connected');
    return seedAboutApp();
  })
  .catch(err => console.error('❌ MongoDB connection failed:', err));

async function seedAboutApp() {
  try {
    // Remove existing data from the AboutApp collection before inserting new data
    await AboutApp.deleteMany();

    // Insert dummy data into the AboutApp collection
    await AboutApp.insertMany([
      {
        content: 'Welcome to the app. This is the Android version of the app.',
        language: 'en',
        platform: 'android',
      },
      {
        content: 'یہ ایپ کا اردو ورژن ہے۔ خوش آمدید!',
        language: 'ur',
        platform: 'android',
      },
      {
        content: 'Welcome to the iOS version of the app.',
        language: 'en',
        platform: 'ios',
      },
      {
        content: 'یہ ایپ کا ویب ورژن ہے۔ براہ کرم اپنے براؤزر کا استعمال کریں۔',
        language: 'ur',
        platform: 'web',
      },
      {
        content: 'Welcome to the web version of the app, enjoy using it on any browser.',
        language: 'en',
        platform: 'web',
      },
    ]);

    console.log('✅ AboutApp data seeded successfully!');
    process.exit(); // Exit the process after seeding
  } catch (err) {
    console.error('❌ Error seeding AboutApp data:', err);
    process.exit(1);
  }
}
