/**
 * @file backend/config/db.js
 * @description MongoDB Atlas connection configuration using Mongoose.
 *
 * Connects to MongoDB Atlas cloud cluster with:
 * - Connection pooling (Mongoose default)
 * - Auto-indexing in development
 * - Graceful error handling (process exits on failure)
 * - Connection event logging
 *
 * @requires mongoose
 * @usage Called once from server.js during application startup.
 */

const mongoose = require('mongoose');

/**
 * Establishes connection to MongoDB Atlas.
 * Uses the MONGO_URI from environment variables.
 * Exits the process with code 1 if connection fails.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    // Handle connection events after initial connection
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully.');
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    // Exit process with failure code — server should not run without a database
    process.exit(1);
  }
};

module.exports = connectDB;
