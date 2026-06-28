/**
 * @file backend/middleware/adminMiddleware.js
 * @description Admin Authorization Middleware
 *
 * Checks if the currently authenticated user has the 'admin' role.
 * MUST be used AFTER the authMiddleware (protect), so req.user is populated.
 */

const ApiError = require('../utils/ApiError');

const authorizeAdmin = (req, res, next) => {
  // Check if req.user exists and role is admin
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    // 403 Forbidden: User is authenticated but lacks required permissions
    throw new ApiError('Not authorized as an admin', 403);
  }
};

module.exports = { authorizeAdmin };
