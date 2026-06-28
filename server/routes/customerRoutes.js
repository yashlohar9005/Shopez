const express = require('express');
const router = express.Router();
const customer = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

// All customer routes require authentication
router.use(protect);

// Dashboard & Analytics
router.get('/dashboard', customer.getDashboardSummary);
router.get('/analytics', customer.getPurchaseAnalytics);
router.get('/recommendations', customer.getRecommendations);

// Orders
router.get('/orders', customer.getOrders);
router.get('/orders/:id', customer.getOrderById);

// Wishlist
router.route('/wishlist')
  .get(customer.getWishlist)
  .post(customer.addToWishlist);
router.delete('/wishlist/:id', customer.removeFromWishlist);

// Addresses
router.route('/addresses')
  .get(customer.getAddresses)
  .post(customer.addAddress);
router.route('/addresses/:id')
  .put(customer.updateAddress)
  .delete(customer.deleteAddress);

module.exports = router;
