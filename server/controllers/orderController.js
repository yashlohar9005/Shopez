/**
 * @file backend/controllers/orderController.js
 * @description Controllers for order management
 */

const orderService = require('../services/orderService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create a new order from cart
 * @route   POST /api/orders
 * @access  Private
 */
exports.createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, order, 'Order created successfully'));
});

/**
 * @desc    Get logged in user's orders
 * @route   GET /api/orders
 * @access  Private
 */
exports.getUserOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getUserOrders(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, result, 'Orders fetched successfully'));
});

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user._id, req.user.role);
  res.status(200).json(new ApiResponse(200, order, 'Order fetched successfully'));
});

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id
 * @access  Private/Admin
 */
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, status);
  res.status(200).json(new ApiResponse(200, order, 'Order status updated successfully'));
});
