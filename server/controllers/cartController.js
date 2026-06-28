/**
 * @file backend/controllers/cartController.js
 * @description Controllers for shopping cart management
 */

const cartService = require('../services/cartService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
exports.getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);
  res.status(200).json(new ApiResponse(200, cart, 'Cart fetched successfully'));
});

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
exports.addItemToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await cartService.addItemToCart(req.user._id, productId, quantity);
  res.status(200).json(new ApiResponse(200, cart, 'Item added to cart'));
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:id
 * @access  Private
 */
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await cartService.updateItemQuantity(req.user._id, req.params.id, quantity);
  res.status(200).json(new ApiResponse(200, cart, 'Cart updated'));
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:id
 * @access  Private
 */
exports.removeCartItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItemFromCart(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, cart, 'Item removed from cart'));
});
