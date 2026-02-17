const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  // If already connected, reuse the connection
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    isConnected = conn.connection.readyState === 1;
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✓ Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    isConnected = false;
    throw error; // Re-throw error instead of process.exit for serverless
  }
};

module.exports = connectDB;
