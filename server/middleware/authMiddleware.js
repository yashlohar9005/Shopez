/**
 * @file backend/middleware/authMiddleware.js
 * @description JWT Authentication Middleware
 *
 * Verifies the JWT token from the Authorization header.
 * If valid, fetches the user from DB and attaches it to req.user.
 * If invalid or missing, throws a 401 Unauthorized error.
 */

const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from "Bearer <token>"
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. If no token found, throw error
  if (!token) {
    throw new ApiError('Not authorized, please login to access this resource', 401);
  }

  try {
    // 3. Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find user by ID embedded in token payload
    const user = await User.findById(decoded.id);

    // 5. Check if user still exists (they might have been deleted)
    if (!user) {
      throw new ApiError('The user belonging to this token no longer exists', 401);
    }

    // 6. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // Distinguish between expired and malformed tokens
    if (error.name === 'TokenExpiredError') {
      throw new ApiError('Your token has expired, please login again', 401);
    }
    throw new ApiError('Not authorized, token failed', 401);
  }
});

module.exports = { protect };
