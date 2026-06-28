/**
 * @file backend/routes/orderRoutes.js
 * @description Routes for order management
 */

const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');

const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderController');

const { protect } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/adminMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createOrderValidation,
  updateOrderStatusValidation,
} = require('../validations/orderValidation');

// All order routes are private (require login)
router.use(protect);

router.route('/')
  .post(createOrderValidation, validate, createOrder)
  .get(getUserOrders);

router.route('/:id')
  .get(getOrderById);

// Admin only routes
router.route('/:id/status')
  .put(authorizeAdmin, updateOrderStatusValidation, validate, updateOrderStatus);

// Customer Actions
router.patch('/:id/cancel', asyncHandler(async (req, res) => {
  const orderService = require('../services/orderService');
  const order = await orderService.cancelOrder(req.params.id, req.user._id);
  res.status(200).json(new (require('../utils/ApiResponse'))(200, order, 'Order cancelled'));
}));

router.patch('/:id/return', asyncHandler(async (req, res) => {
  const orderService = require('../services/orderService');
  const order = await orderService.returnOrder(req.params.id, req.user._id);
  res.status(200).json(new (require('../utils/ApiResponse'))(200, order, 'Return requested'));
}));

module.exports = router;
