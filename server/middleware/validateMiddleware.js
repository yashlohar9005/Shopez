/**
 * @file backend/middleware/validateMiddleware.js
 * @description Express-Validator Result Middleware
 *
 * Runs the validation rules and checks if there are any validation errors.
 * If errors exist, throws an ApiError with status 400 and the array of errors.
 */

const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Format errors into a simple array of strings for easier frontend consumption
    const extractedErrors = errors.array().map((err) => err.msg);
    
    // Create an ApiError with the first error message as the main message,
    // and pass the full array of errors in the errors array property.
    throw new ApiError(extractedErrors[0], 400, extractedErrors);
  }
  
  next();
};

module.exports = validate;
