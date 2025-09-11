const mongoose = require('mongoose');
const TermsAndConditions = require('../models/termsAndConditionsModel'); // Adjust the path to your TermsAndConditions model

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI) // Using MONGO_URI from your .env file
  .then(() => {
    console.log('✅ MongoDB connected');
    return seedTermsAndConditions();
  })
  .catch(err => console.error('❌ MongoDB connection failed:', err));

async function seedTermsAndConditions() {
  try {
    // Remove all existing data from the TermsAndConditions collection before inserting new data
    await TermsAndConditions.deleteMany();

    // Insert dummy data into the collection
    await TermsAndConditions.insertMany([
      {
        version: '1.0',
        content: 'These are the terms and conditions for version 1.0 of the app.',
        language: 'en',
      },
      {
        version: '1.1',
        content: 'Updated terms and conditions for version 1.1, with some changes.',
        language: 'es',
      },
      {
        version: '2.0',
        content: 'Terms and conditions for version 2.0, with additional clauses.',
        language: 'fr',
      },
      {
        version: '2.1',
        content: 'Minor updates in the terms for version 2.1.',
        language: 'ur',
      },
      {
        version: '3.0',
        content: 'Full revision of the terms and conditions for version 3.0.',
        language: 'en',
      },
    ]);

    console.log('✅ Terms and Conditions seeded successfully!');
    process.exit(); // Exit the process after seeding
  } catch (err) {
    console.error('❌ Error seeding Terms and Conditions:', err);
    process.exit(1);
  }
}
