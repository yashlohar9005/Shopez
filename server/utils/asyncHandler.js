/**
 * @file backend/utils/asyncHandler.js
 * @description Wrapper for async Express route handlers.
 *
 * Eliminates the need for try/catch blocks in controllers.
 * Catches rejected promises and passes the error to the Express
 * next() function, which forwards it to errorMiddleware.js.
 *
 * @param {Function} requestHandler - The async controller function
 * @returns {Function} Express middleware function
 */

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

module.exports = asyncHandler;
