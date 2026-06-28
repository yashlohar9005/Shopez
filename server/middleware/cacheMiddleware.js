/**
 * @file backend/middleware/cacheMiddleware.js
 * @description Middleware to cache GET requests.
 */

const cache = require('../utils/cache');

const cacheMiddleware = (ttlSeconds = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }

    // Override res.json to intercept the response and cache it
    const originalJson = res.json;
    res.json = function (body) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, body, ttlSeconds);
      }
      return originalJson.call(this, body);
    };

    next();
  };
};

module.exports = cacheMiddleware;
