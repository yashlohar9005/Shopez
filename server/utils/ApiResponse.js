/**
 * @file backend/utils/ApiResponse.js
 * @description Standardized success response wrapper.
 *
 * Ensures all successful API responses have a consistent shape:
 * { statusCode, data, message, success }
 */

class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code (e.g. 200, 201)
   * @param {any} data - The payload to send back to the client
   * @param {string} message - Success message (default: 'Success')
   */
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    // Status codes below 400 indicate success
    this.success = statusCode < 400;
  }
}

module.exports = ApiResponse;
