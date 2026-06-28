/**
 * @file backend/middleware/errorMiddleware.js
 * @description Global Error Handling Middleware
 *
 * Catches all errors thrown in the application.
 * Formats Mongoose errors (CastError, DuplicateKey) into readable messages.
 * Sends a consistent JSON response using the format expected by the frontend.
 */

const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error stack to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    error = new ApiError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered for: ${field}. Please use another value.`;
    error = new ApiError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = new ApiError(message, 400);
  }

  // Default to 500 server error if status code not set
  const statusCode = error.statusCode || 500;
  
  // Hide internal server error messages in production
  let message = error.message || 'Internal Server Error';
  if (process.env.NODE_ENV === 'production' && statusCode === 500 && !error.isOperational) {
    message = 'Internal Server Error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Send array of validation errors if present
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    // Only send stack trace in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = { errorHandler };
