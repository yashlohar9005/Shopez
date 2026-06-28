/**
 * @file backend/server.js
 * @description SHOPEZ Backend — Express.js Application Entry Point.
 *
 * Responsibilities:
 * 1. Load environment variables from .env
 * 2. Initialize Express application
 * 3. Configure global middleware pipeline (CORS, Helmet, Morgan, Rate Limiter, Body Parser)
 * 4. Mount API route groups under /api prefix
 * 5. Connect to MongoDB Atlas
 * 6. Start HTTP server
 * 7. Handle global errors and unhandled rejections
 *
 * @requires express
 * @requires cors
 * @requires helmet
 * @requires morgan
 * @requires express-rate-limit
 * @requires dotenv
 */

// Load environment variables FIRST — before any other imports that might use them
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorMiddleware');
const {
  helmet,
  mongoSanitize,
  xss,
  hpp,
  compression,
  globalLimiter,
  authLimiter
} = require('./middleware/securityMiddleware');

// Database connection
const connectDB = require('./config/db');

// ============================================
// Initialize Express Application
// ============================================
const app = express();

// ============================================
// Global Middleware Pipeline
// ============================================

/**
 * 1. CORS — Cross-Origin Resource Sharing
 * Allows the React frontend to make requests to this API.
 */
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * 2. Security Headers (Helmet)
 */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

/**
 * 3. Rate Limiter (Global)
 */
app.use('/api', globalLimiter);

/**
 * 4. Compression
 */
app.use(compression());

/**
 * 5. Body Parser
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * 6. Data Sanitization (NoSQL Injection & XSS)
 */
app.use(mongoSanitize());
app.use(xss());

/**
 * 7. HTTP Parameter Pollution Protection
 */
app.use(hpp());

/**
 * 8. Morgan — HTTP Request Logger
 * Uses 'dev' format in development and 'combined' format in production.
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Use combined format in production to capture IP, user-agent, etc.
  app.use(morgan('combined'));
}

// ============================================
// Health Check Endpoint
// ============================================

/**
 * @route   GET /api/health
 * @desc    Health check endpoint — verifies server is running
 * @access  Public
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SHOPEZ API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// API Routes
// ============================================

app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/customer', require('./routes/customerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// Serve static files from the uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// 404 Handler — Catch unmatched routes
// ============================================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ============================================
// Global Error Handler
// ============================================

app.use(errorHandler);

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 5000;

/**
 * Connect to MongoDB and start the Express server.
 * Database connection is established before the server starts listening.
 */
const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();

    // Start listening for HTTP requests
    app.listen(PORT, () => {
      console.log(`\n🚀 SHOPEZ API Server is running!`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health\n`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// ============================================
// Handle Unhandled Promise Rejections
// ============================================
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Close server & exit process
  process.exit(1);
});

// ============================================
// Handle Uncaught Exceptions
// ============================================
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

// Launch the server only if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
