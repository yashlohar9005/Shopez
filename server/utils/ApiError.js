/**
 * @file backend/utils/ApiError.js
 * @description Custom Error class for API responses.
 *
 * Extends the built-in Error class to include HTTP status codes,
 * operational flags, and validation error details.
 *
 * This allows controllers and services to throw errors like:
 * throw new ApiError('Product not found', 404);
 */

class ApiError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Array} errors - Array of validation errors (optional)
   * @param {string} stack - Custom stack trace (optional)
   */
  constructor(message = 'Something went wrong', statusCode = 500, errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    // Flag to distinguish operational errors (e.g. invalid input)
    // from programming bugs (e.g. undefined variable)
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
