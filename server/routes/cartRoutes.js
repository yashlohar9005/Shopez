/**
 * @file backend/routes/cartRoutes.js
 * @description Routes for shopping cart management
 */

const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');

const {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
} = require('../controllers/cartController');

const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  addToCartValidation,
  updateCartItemValidation,
  removeCartItemValidation,
} = require('../validations/cartValidation');

// All cart routes are private (require login)
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCartValidation, validate, addItemToCart);

router.route('/:id')
  .put(updateCartItemValidation, validate, updateCartItem)
  .delete(removeCartItemValidation, validate, removeCartItem);

// New Advanced Features
router.post('/coupon', asyncHandler(async (req, res) => {
  const cartService = require('../services/cartService');
  const cart = await cartService.applyCoupon(req.user._id, req.body.code);
  res.status(200).json(new (require('../utils/ApiResponse'))(200, cart, 'Coupon applied'));
}));

router.post('/save-for-later/:id', asyncHandler(async (req, res) => {
  const cartService = require('../services/cartService');
  const cart = await cartService.moveToSavedForLater(req.user._id, req.params.id);
  res.status(200).json(new (require('../utils/ApiResponse'))(200, cart, 'Moved to saved for later'));
}));

router.post('/move-to-cart/:id', asyncHandler(async (req, res) => {
  const cartService = require('../services/cartService');
  const cart = await cartService.moveToCart(req.user._id, req.params.id);
  res.status(200).json(new (require('../utils/ApiResponse'))(200, cart, 'Moved to cart'));
}));

module.exports = router;
