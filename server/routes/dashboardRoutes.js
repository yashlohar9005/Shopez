/**
 * @file backend/routes/dashboardRoutes.js
 * @description Routes for Live Dashboard analytics.
 */

const express = require('express');
const router = express.Router();
const dashboard = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/adminMiddleware');

// All dashboard routes are admin-only
router.use(protect);
router.use(authorizeAdmin);

router.get('/summary', dashboard.getSummary);
router.get('/revenue', dashboard.getRevenue);
router.get('/orders', dashboard.getOrders);
router.get('/products', dashboard.getProducts);
router.get('/customers', dashboard.getCustomers);
router.get('/inventory', dashboard.getInventory);
router.get('/activity', dashboard.getActivity);
router.get('/analytics', dashboard.getAnalytics);

module.exports = router;
