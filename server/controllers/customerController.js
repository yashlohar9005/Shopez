const customerService = require('../services/customerService');
const orderService = require('../services/orderService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ============================================
// DASHBOARD & ANALYTICS
// ============================================

exports.getDashboardSummary = asyncHandler(async (req, res) => {
  const data = await customerService.getDashboardSummary(req.user._id);
  res.status(200).json(new ApiResponse(200, data, 'Customer dashboard summary retrieved'));
});

exports.getPurchaseAnalytics = asyncHandler(async (req, res) => {
  const data = await customerService.getPurchaseAnalytics(req.user._id);
  res.status(200).json(new ApiResponse(200, data, 'Purchase analytics retrieved'));
});

// ============================================
// ORDERS (Reuses orderService logic but strictly for the logged-in user)
// ============================================

exports.getOrders = asyncHandler(async (req, res) => {
  // Pass req.query for pagination, searching, etc.
  const result = await orderService.getUserOrders(req.user._id, req.query); 
  res.status(200).json(new ApiResponse(200, result, 'Orders retrieved'));
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  // Ensure the order belongs to the user
  if (order.user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }
  res.status(200).json(new ApiResponse(200, order, 'Order details retrieved'));
});

// ============================================
// WISHLIST
// ============================================

exports.getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await customerService.getWishlist(req.user._id);
  res.status(200).json(new ApiResponse(200, wishlist, 'Wishlist retrieved'));
});

exports.addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const wishlist = await customerService.addToWishlist(req.user._id, productId);
  res.status(200).json(new ApiResponse(200, wishlist, 'Added to wishlist'));
});

exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await customerService.removeFromWishlist(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, wishlist, 'Removed from wishlist'));
});

// ============================================
// ADDRESSES
// ============================================

exports.getAddresses = asyncHandler(async (req, res) => {
  const addresses = await customerService.getAddresses(req.user._id);
  res.status(200).json(new ApiResponse(200, addresses, 'Addresses retrieved'));
});

exports.addAddress = asyncHandler(async (req, res) => {
  const addresses = await customerService.addAddress(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, addresses, 'Address added'));
});

exports.updateAddress = asyncHandler(async (req, res) => {
  const addresses = await customerService.updateAddress(req.user._id, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, addresses, 'Address updated'));
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  const addresses = await customerService.deleteAddress(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, addresses, 'Address deleted'));
});

// ============================================
// RECOMMENDATIONS
// ============================================

exports.getRecommendations = asyncHandler(async (req, res) => {
  const data = await customerService.getRecommendations(req.user._id);
  res.status(200).json(new ApiResponse(200, data, 'Recommendations retrieved'));
});
