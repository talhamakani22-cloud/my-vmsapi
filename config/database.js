const mongoose = require('mongoose');

// MongoDB connection string - update with your MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/visitor_management';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      // These options are no longer needed in Mongoose 6+, but included for compatibility
    });

    // Only log after connection is ready
    if (conn && conn.connection && conn.connection.host && conn.connection.name) {
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`📦 Database: ${conn.connection.name}`);
    } else {
      console.log('✅ MongoDB Connected');
    }

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      if (mongoose.connection && mongoose.connection.host && mongoose.connection.name) {
        console.log(`🔄 MongoDB reconnected: ${mongoose.connection.host}`);
        console.log(`📦 Database: ${mongoose.connection.name}`);
      } else {
        console.log('🔄 MongoDB reconnected');
      }
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    // Exit process with failure
    process.exit(1);
  }
};

// Graceful shutdown
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

module.exports = { connectDB, disconnectDB, mongoose };
