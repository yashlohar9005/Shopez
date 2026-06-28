/**
 * @file backend/routes/adminRoutes.js
 * @description Admin Dashboard Routes — All admin API endpoints.
 *
 * All routes are protected by:
 * 1. protect (JWT verification)
 * 2. authorizeAdmin (role === 'admin' check)
 *
 * Route groups:
 * - /dashboard — Dashboard data
 * - /stats — Legacy stats endpoint
 * - /users — User management
 * - /products — Product management
 * - /inventory — Inventory management
 * - /categories — Category management
 * - /orders — Order management
 * - /transactions — Transaction data
 * - /analytics — Analytics & charts
 * - /reviews — Review moderation
 * - /coupons — Coupon management
 * - /notifications — Notification management
 */

const express = require('express');
const router = express.Router();

const admin = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/adminMiddleware');

// ============================================
// Apply auth + admin middleware to ALL routes
// ============================================
router.use(protect);
router.use(authorizeAdmin);

// ============================================
// DASHBOARD
// ============================================
router.get('/dashboard', admin.getDashboardData);
router.get('/stats', admin.getDashboardStats);

// ============================================
// USER MANAGEMENT
// ============================================
router.get('/users', admin.getUsers);
router.get('/users/:id', admin.getUserById);
router.put('/users/:id', admin.updateUser);
router.delete('/users/:id', admin.deleteUser);
router.patch('/users/:id/block', admin.toggleBlockUser);
router.patch('/users/:id/role', admin.changeUserRole);

// ============================================
// PRODUCT MANAGEMENT
// ============================================
router.get('/products', admin.getAdminProducts);
router.post('/products', admin.createProduct);
router.put('/products/:id', admin.updateProduct);
router.delete('/products/:id', admin.deleteProduct);
router.patch('/products/:id/stock', admin.updateProductStock);
router.post('/products/bulk-stock', admin.bulkUpdateStock);

// ============================================
// INVENTORY
// ============================================
router.get('/inventory', admin.getInventory);

// ============================================
// CATEGORY MANAGEMENT
// ============================================
router.get('/categories', admin.getCategories);
router.post('/categories', admin.createCategory);
router.put('/categories/:id', admin.updateCategory);
router.delete('/categories/:id', admin.deleteCategory);

// ============================================
// ORDER MANAGEMENT
// ============================================
router.get('/orders', admin.getAllOrders);
router.get('/orders/:id', admin.getOrderDetails);
router.patch('/orders/:id/status', admin.updateOrderStatus);
router.patch('/orders/:id/cancel', admin.cancelOrder);

// ============================================
// TRANSACTIONS
// ============================================
router.get('/transactions', admin.getTransactions);
router.get('/transactions/stats', admin.getTransactionStats);

// ============================================
// ANALYTICS
// ============================================
router.get('/analytics/revenue', admin.getRevenueAnalytics);
router.get('/analytics/orders', admin.getOrderAnalytics);
router.get('/analytics/users', admin.getUserAnalytics);
router.get('/analytics/top-products', admin.getTopSellingProducts);
router.get('/analytics/top-categories', admin.getTopCategories);
router.get('/analytics/growth', admin.getMonthlyGrowth);

// ============================================
// REVIEWS
// ============================================
router.get('/reviews', admin.getReviews);
router.delete('/reviews/:id', admin.deleteReview);
router.patch('/reviews/:id/approve', admin.toggleReviewApproval);
router.patch('/reviews/:id/spam', admin.toggleReviewSpam);

// ============================================
// COUPONS
// ============================================
router.get('/coupons', admin.getCoupons);
router.post('/coupons', admin.createCoupon);
router.put('/coupons/:id', admin.updateCoupon);
router.delete('/coupons/:id', admin.deleteCoupon);
router.patch('/coupons/:id/toggle', admin.toggleCouponStatus);

// ============================================
// NOTIFICATIONS
// ============================================
router.get('/notifications', admin.getNotifications);
router.get('/notifications/unread-count', admin.getUnreadNotificationCount);
router.patch('/notifications/read-all', admin.markAllNotificationsRead);
router.patch('/notifications/:id/read', admin.markNotificationRead);

module.exports = router;
