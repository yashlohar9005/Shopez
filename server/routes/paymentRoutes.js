const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// All payment routes are protected
router.use(protect);

router.get('/key', protect, paymentController.getRazorpayKey);
router.post('/create-order', protect, paymentController.createRazorpayOrder);
router.post('/verify', protect, paymentController.verifyPayment);

// New Transactions endpoint
router.get('/transactions', protect, paymentController.getTransactions);

module.exports = router;
