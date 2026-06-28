/**
 * @file backend/controllers/adminController.js
 * @description Admin Dashboard Controller — Handles all admin API endpoints.
 *
 * All routes are protected by protect + authorizeAdmin middleware.
 * Delegates business logic to adminService.
 */

const adminService = require('../services/adminService');
const productService = require('../services/productService');
const categoryService = require('../services/categoryService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ============================================
// DASHBOARD
// ============================================

/**
 * @desc    Get comprehensive dashboard data
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
exports.getDashboardData = asyncHandler(async (req, res) => {
  const data = await adminService.getDashboardData();
  res.status(200).json(new ApiResponse(200, data, 'Dashboard data retrieved successfully'));
});

/**
 * @desc    Get dashboard stats (legacy endpoint for backward compatibility)
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const data = await adminService.getDashboardData();
  res.status(200).json(new ApiResponse(200, data.summary, 'Dashboard stats retrieved successfully'));
});

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * @desc    Get all users with search, filter, sort, pagination
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getUsers = asyncHandler(async (req, res) => {
  const result = await adminService.getUsers(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Users retrieved successfully'));
});

/**
 * @desc    Get user by ID with order summary
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
exports.getUserById = asyncHandler(async (req, res) => {
  const result = await adminService.getUserById(req.params.id);
  res.status(200).json(new ApiResponse(200, result, 'User details retrieved successfully'));
});

/**
 * @desc    Update user details
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await adminService.updateUser(req.params.id, req.body, req.user._id);
  res.status(200).json(new ApiResponse(200, user, 'User updated successfully'));
});

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, null, 'User deleted successfully'));
});

/**
 * @desc    Block/Unblock a user
 * @route   PATCH /api/admin/users/:id/block
 * @access  Private/Admin
 */
exports.toggleBlockUser = asyncHandler(async (req, res) => {
  const result = await adminService.toggleBlockUser(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, result, `User ${result.isBlocked ? 'blocked' : 'unblocked'} successfully`));
});

/**
 * @desc    Change user role
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private/Admin
 */
exports.changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const result = await adminService.changeUserRole(req.params.id, role, req.user._id);
  res.status(200).json(new ApiResponse(200, result, 'User role updated successfully'));
});

// ============================================
// PRODUCT MANAGEMENT
// ============================================

/**
 * @desc    Get all products (admin view — includes inactive)
 * @route   GET /api/admin/products
 * @access  Private/Admin
 */
exports.getAdminProducts = asyncHandler(async (req, res) => {
  const result = await adminService.getAdminProducts(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Products retrieved successfully'));
});

/**
 * @desc    Create a product
 * @route   POST /api/admin/products
 * @access  Private/Admin
 */
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
});

/**
 * @desc    Update a product
 * @route   PUT /api/admin/products/:id
 * @access  Private/Admin
 */
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, product, 'Product updated successfully'));
});

/**
 * @desc    Delete a product (soft delete)
 * @route   DELETE /api/admin/products/:id
 * @access  Private/Admin
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
});

/**
 * @desc    Update product stock
 * @route   PATCH /api/admin/products/:id/stock
 * @access  Private/Admin
 */
exports.updateProductStock = asyncHandler(async (req, res) => {
  const { change } = req.body;
  const product = await adminService.updateProductStock(req.params.id, change);
  res.status(200).json(new ApiResponse(200, product, 'Product stock updated successfully'));
});

/**
 * @desc    Bulk update product stock
 * @route   POST /api/admin/products/bulk-stock
 * @access  Private/Admin
 */
exports.bulkUpdateStock = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const results = await adminService.bulkUpdateStock(items);
  res.status(200).json(new ApiResponse(200, results, 'Bulk stock update completed'));
});

// ============================================
// INVENTORY
// ============================================

/**
 * @desc    Get inventory overview
 * @route   GET /api/admin/inventory
 * @access  Private/Admin
 */
exports.getInventory = asyncHandler(async (req, res) => {
  const result = await adminService.getInventory(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Inventory data retrieved successfully'));
});

// ============================================
// CATEGORY MANAGEMENT
// ============================================

/**
 * @desc    Get all categories (admin view)
 * @route   GET /api/admin/categories
 * @access  Private/Admin
 */
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories();
  res.status(200).json(new ApiResponse(200, categories, 'Categories retrieved successfully'));
});

/**
 * @desc    Create a category
 * @route   POST /api/admin/categories
 * @access  Private/Admin
 */
exports.createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
});

/**
 * @desc    Update a category
 * @route   PUT /api/admin/categories/:id
 * @access  Private/Admin
 */
exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, category, 'Category updated successfully'));
});

/**
 * @desc    Delete a category (soft delete)
 * @route   DELETE /api/admin/categories/:id
 * @access  Private/Admin
 */
exports.deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Category deleted successfully'));
});

// ============================================
// ORDER MANAGEMENT
// ============================================

/**
 * @desc    Get all orders with filters and pagination
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
exports.getAllOrders = asyncHandler(async (req, res) => {
  const result = await adminService.getAllOrders(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Orders retrieved successfully'));
});

/**
 * @desc    Get order details by ID
 * @route   GET /api/admin/orders/:id
 * @access  Private/Admin
 */
exports.getOrderDetails = asyncHandler(async (req, res) => {
  const order = await adminService.getOrderDetails(req.params.id);
  res.status(200).json(new ApiResponse(200, order, 'Order details retrieved successfully'));
});

/**
 * @desc    Update order status
 * @route   PATCH /api/admin/orders/:id/status
 * @access  Private/Admin
 */
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await adminService.updateOrderStatus(req.params.id, status);
  res.status(200).json(new ApiResponse(200, order, 'Order status updated successfully'));
});

/**
 * @desc    Cancel an order
 * @route   PATCH /api/admin/orders/:id/cancel
 * @access  Private/Admin
 */
exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await adminService.cancelOrder(req.params.id);
  res.status(200).json(new ApiResponse(200, order, 'Order cancelled successfully'));
});

// ============================================
// TRANSACTIONS
// ============================================

/**
 * @desc    Get transactions with filters
 * @route   GET /api/admin/transactions
 * @access  Private/Admin
 */
exports.getTransactions = asyncHandler(async (req, res) => {
  const result = await adminService.getTransactions(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Transactions retrieved successfully'));
});

/**
 * @desc    Get transaction statistics
 * @route   GET /api/admin/transactions/stats
 * @access  Private/Admin
 */
exports.getTransactionStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getTransactionStats(req.query);
  res.status(200).json(new ApiResponse(200, stats, 'Transaction stats retrieved successfully'));
});

// ============================================
// ANALYTICS
// ============================================

/**
 * @desc    Get revenue analytics
 * @route   GET /api/admin/analytics/revenue
 * @access  Private/Admin
 */
exports.getRevenueAnalytics = asyncHandler(async (req, res) => {
  const data = await adminService.getRevenueAnalytics(req.query.period);
  res.status(200).json(new ApiResponse(200, data, 'Revenue analytics retrieved successfully'));
});

/**
 * @desc    Get order analytics
 * @route   GET /api/admin/analytics/orders
 * @access  Private/Admin
 */
exports.getOrderAnalytics = asyncHandler(async (req, res) => {
  const data = await adminService.getOrderAnalytics(req.query.period);
  res.status(200).json(new ApiResponse(200, data, 'Order analytics retrieved successfully'));
});

/**
 * @desc    Get user analytics
 * @route   GET /api/admin/analytics/users
 * @access  Private/Admin
 */
exports.getUserAnalytics = asyncHandler(async (req, res) => {
  const data = await adminService.getUserAnalytics();
  res.status(200).json(new ApiResponse(200, data, 'User analytics retrieved successfully'));
});

/**
 * @desc    Get top selling products
 * @route   GET /api/admin/analytics/top-products
 * @access  Private/Admin
 */
exports.getTopSellingProducts = asyncHandler(async (req, res) => {
  const data = await adminService.getTopSellingProducts(req.query.limit);
  res.status(200).json(new ApiResponse(200, data, 'Top selling products retrieved successfully'));
});

/**
 * @desc    Get top categories
 * @route   GET /api/admin/analytics/top-categories
 * @access  Private/Admin
 */
exports.getTopCategories = asyncHandler(async (req, res) => {
  const data = await adminService.getTopCategories(req.query.limit);
  res.status(200).json(new ApiResponse(200, data, 'Top categories retrieved successfully'));
});

/**
 * @desc    Get monthly growth data
 * @route   GET /api/admin/analytics/growth
 * @access  Private/Admin
 */
exports.getMonthlyGrowth = asyncHandler(async (req, res) => {
  const data = await adminService.getMonthlyGrowth();
  res.status(200).json(new ApiResponse(200, data, 'Monthly growth data retrieved successfully'));
});

// ============================================
// REVIEWS
// ============================================

/**
 * @desc    Get all reviews
 * @route   GET /api/admin/reviews
 * @access  Private/Admin
 */
exports.getReviews = asyncHandler(async (req, res) => {
  const result = await adminService.getAllReviews(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Reviews retrieved successfully'));
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/admin/reviews/:id
 * @access  Private/Admin
 */
exports.deleteReview = asyncHandler(async (req, res) => {
  await adminService.deleteReview(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Review deleted successfully'));
});

/**
 * @desc    Toggle review approval
 * @route   PATCH /api/admin/reviews/:id/approve
 * @access  Private/Admin
 */
exports.toggleReviewApproval = asyncHandler(async (req, res) => {
  const review = await adminService.toggleReviewApproval(req.params.id);
  res.status(200).json(new ApiResponse(200, review, `Review ${review.isApproved ? 'approved' : 'rejected'}`));
});

/**
 * @desc    Toggle review spam flag
 * @route   PATCH /api/admin/reviews/:id/spam
 * @access  Private/Admin
 */
exports.toggleReviewSpam = asyncHandler(async (req, res) => {
  const review = await adminService.toggleReviewSpam(req.params.id);
  res.status(200).json(new ApiResponse(200, review, `Review ${review.isSpam ? 'flagged as spam' : 'unflagged'}`));
});

// ============================================
// COUPONS
// ============================================

/**
 * @desc    Create a coupon
 * @route   POST /api/admin/coupons
 * @access  Private/Admin
 */
exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await adminService.createCoupon(req.body);
  res.status(201).json(new ApiResponse(201, coupon, 'Coupon created successfully'));
});

/**
 * @desc    Get all coupons
 * @route   GET /api/admin/coupons
 * @access  Private/Admin
 */
exports.getCoupons = asyncHandler(async (req, res) => {
  const result = await adminService.getCoupons(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Coupons retrieved successfully'));
});

/**
 * @desc    Update a coupon
 * @route   PUT /api/admin/coupons/:id
 * @access  Private/Admin
 */
exports.updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await adminService.updateCoupon(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, coupon, 'Coupon updated successfully'));
});

/**
 * @desc    Delete a coupon
 * @route   DELETE /api/admin/coupons/:id
 * @access  Private/Admin
 */
exports.deleteCoupon = asyncHandler(async (req, res) => {
  await adminService.deleteCoupon(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Coupon deleted successfully'));
});

/**
 * @desc    Toggle coupon active status
 * @route   PATCH /api/admin/coupons/:id/toggle
 * @access  Private/Admin
 */
exports.toggleCouponStatus = asyncHandler(async (req, res) => {
  const coupon = await adminService.toggleCouponStatus(req.params.id);
  res.status(200).json(new ApiResponse(200, coupon, `Coupon ${coupon.isActive ? 'enabled' : 'disabled'}`));
});

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * @desc    Get notifications
 * @route   GET /api/admin/notifications
 * @access  Private/Admin
 */
exports.getNotifications = asyncHandler(async (req, res) => {
  const result = await adminService.getNotifications(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Notifications retrieved successfully'));
});

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/admin/notifications/:id/read
 * @access  Private/Admin
 */
exports.markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await adminService.markNotificationRead(req.params.id);
  res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read'));
});

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/admin/notifications/read-all
 * @access  Private/Admin
 */
exports.markAllNotificationsRead = asyncHandler(async (req, res) => {
  await adminService.markAllNotificationsRead();
  res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
});

/**
 * @desc    Get unread notification count
 * @route   GET /api/admin/notifications/unread-count
 * @access  Private/Admin
 */
exports.getUnreadNotificationCount = asyncHandler(async (req, res) => {
  const count = await adminService.getUnreadNotificationCount();
  res.status(200).json(new ApiResponse(200, { count }, 'Unread count retrieved'));
});
