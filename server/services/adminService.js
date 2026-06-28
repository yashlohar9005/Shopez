/**
 * @file backend/services/adminService.js
 * @description Business logic for all admin dashboard operations.
 *
 * Provides methods for:
 * - Dashboard statistics & summary data
 * - User management (CRUD, block, role change)
 * - Product management (admin view includes inactive)
 * - Inventory management (stock updates, bulk operations)
 * - Order management (all orders, status updates, cancellation)
 * - Transaction analytics
 * - Analytics (revenue, orders, users, top products, growth)
 * - Review moderation
 * - Coupon management
 * - Notification management
 */

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

class AdminService {
  // ============================================
  // DASHBOARD
  // ============================================

  /**
   * Get comprehensive dashboard data including summary stats,
   * recent orders, latest users, low stock products, and monthly charts.
   */
  async getDashboardData() {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueData,
      pendingOrders,
      outOfStockProducts,
      recentOrders,
      latestUsers,
      lowStockProducts,
      monthlyRevenue,
      monthlyOrders,
    ] = await Promise.all([
      User.countDocuments({}),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments({}),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' }, paymentStatus: 'paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
      ]),
      Order.countDocuments({ orderStatus: 'processing' }),
      Product.countDocuments({ isActive: true, stock: 0 }),
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email avatar'),
      User.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email avatar role createdAt isBlocked'),
      Product.find({ isActive: true, stock: { $gt: 0, $lt: 5 } })
        .sort({ stock: 1 })
        .limit(10)
        .select('name stock price images'),
      this._getMonthlyData('revenue'),
      this._getMonthlyData('orders'),
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    return {
      summary: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        outOfStockProducts,
      },
      recentOrders,
      latestUsers,
      lowStockProducts,
      monthlyRevenue,
      monthlyOrders,
    };
  }

  /**
   * Helper: Get monthly aggregated data for the last 12 months.
   * @param {'revenue'|'orders'} type
   */
  async _getMonthlyData(type) {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const pipeline = [
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          ...(type === 'revenue'
            ? { total: { $sum: '$totalPrice' } }
            : { total: { $sum: 1 } }),
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ];

    if (type === 'revenue') {
      pipeline[0].$match.paymentStatus = 'paid';
      pipeline[0].$match.orderStatus = { $ne: 'cancelled' };
    }

    const data = await Order.aggregate(pipeline);

    // Fill in missing months with 0
    const result = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = data.find((item) => item._id.year === year && item._id.month === month);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      result.push({
        label: `${monthNames[month - 1]} ${year}`,
        value: found ? found.total : 0,
      });
    }

    return result;
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  /**
   * Get paginated users with search, filter, and sort.
   */
  async getUsers(queryObj) {
    const {
      search,
      role,
      sort = '-createdAt',
      page = 1,
      limit = 10,
    } = queryObj;

    const query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    // Filter by role
    if (role && ['user', 'admin'].includes(role)) {
      query.role = role;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get a single user by ID with order summary.
   */
  async getUserById(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Get user's order summary
    const orderStats = await Order.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
        },
      },
    ]);

    return {
      user,
      orderSummary: orderStats.length > 0
        ? { totalOrders: orderStats[0].totalOrders, totalSpent: orderStats[0].totalSpent }
        : { totalOrders: 0, totalSpent: 0 },
    };
  }

  /**
   * Update user profile (admin editing another user).
   */
  async updateUser(userId, updateData, adminId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Check email uniqueness if updating email
    if (updateData.email && updateData.email !== user.email) {
      const emailExists = await User.findOne({ email: updateData.email });
      if (emailExists) {
        throw new ApiError('Email is already in use by another account', 400);
      }
    }

    // Update allowed fields
    const allowedFields = ['name', 'email', 'phone', 'role'];
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    });

    // Update address if provided
    if (updateData.address) {
      user.address = { ...user.address?.toObject?.() || {}, ...updateData.address };
    }

    const updatedUser = await user.save();
    return updatedUser;
  }

  /**
   * Delete a user (cannot delete self).
   */
  async deleteUser(userId, adminId) {
    if (userId === adminId.toString()) {
      throw new ApiError('You cannot delete your own account', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    if (user.role === 'admin') {
      throw new ApiError('Cannot delete another admin account', 400);
    }

    await User.findByIdAndDelete(userId);
    return true;
  }

  /**
   * Toggle block/unblock a user.
   */
  async toggleBlockUser(userId, adminId) {
    if (userId === adminId.toString()) {
      throw new ApiError('You cannot block yourself', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    if (user.role === 'admin') {
      throw new ApiError('Cannot block an admin account', 400);
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      isBlocked: user.isBlocked,
    };
  }

  /**
   * Change a user's role.
   */
  async changeUserRole(userId, newRole, adminId) {
    if (userId === adminId.toString() && newRole === 'user') {
      throw new ApiError('You cannot downgrade your own admin role', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    user.role = newRole;
    await user.save();

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  // ============================================
  // PRODUCT MANAGEMENT (Admin view)
  // ============================================

  /**
   * Get all products for admin (including inactive / soft-deleted).
   */
  async getAdminProducts(queryObj) {
    const {
      search,
      category,
      sort = '-createdAt',
      page = 1,
      limit = 10,
    } = queryObj;

    const query = {};

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
      ];
    }

    if (category) {
      query.category = category;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('category', 'name slug'),
      Product.countDocuments(query),
    ]);

    return {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Update product stock (increment or decrement).
   */
  async updateProductStock(productId, stockChange) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError('Product not found', 404);
    }

    const newStock = product.stock + stockChange;
    if (newStock < 0) {
      throw new ApiError('Stock cannot go below 0', 400);
    }

    product.stock = newStock;
    await product.save();

    // Create low stock notification if needed
    if (newStock > 0 && newStock < 5) {
      await this._createNotification('low_stock', 'Low Stock Alert', `${product.name} has only ${newStock} items left in stock`, { productId: product._id, stock: newStock });
    } else if (newStock === 0) {
      await this._createNotification('low_stock', 'Out of Stock', `${product.name} is now out of stock`, { productId: product._id, stock: 0 });
    }

    return product;
  }

  /**
   * Bulk update stock for multiple products.
   */
  async bulkUpdateStock(items) {
    const results = [];

    for (const item of items) {
      try {
        const product = await Product.findById(item.productId);
        if (!product) {
          results.push({ productId: item.productId, success: false, error: 'Product not found' });
          continue;
        }

        const newStock = item.stock !== undefined ? item.stock : product.stock + (item.change || 0);
        if (newStock < 0) {
          results.push({ productId: item.productId, success: false, error: 'Stock cannot go below 0' });
          continue;
        }

        product.stock = newStock;
        await product.save();
        results.push({ productId: item.productId, success: true, newStock });
      } catch (err) {
        results.push({ productId: item.productId, success: false, error: err.message });
      }
    }

    return results;
  }

  // ============================================
  // INVENTORY
  // ============================================

  /**
   * Get inventory overview with stock level categorization.
   */
  async getInventory(queryObj) {
    const { filter, page = 1, limit = 20 } = queryObj;

    const query = { isActive: true };

    if (filter === 'out_of_stock') {
      query.stock = 0;
    } else if (filter === 'low_stock') {
      query.stock = { $gt: 0, $lt: 5 };
    } else if (filter === 'in_stock') {
      query.stock = { $gte: 5 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total, stockSummary] = await Promise.all([
      Product.find(query)
        .sort({ stock: 1 })
        .skip(skip)
        .limit(limitNum)
        .select('name stock price images category brand')
        .populate('category', 'name'),
      Product.countDocuments(query),
      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStock: { $sum: '$stock' },
            outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } },
            lowStock: { $sum: { $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lt: ['$stock', 5] }] }, 1, 0] } },
            inStock: { $sum: { $cond: [{ $gte: ['$stock', 5] }, 1, 0] } },
          },
        },
      ]),
    ]);

    return {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      summary: stockSummary.length > 0 ? stockSummary[0] : {
        totalProducts: 0, totalStock: 0, outOfStock: 0, lowStock: 0, inStock: 0,
      },
    };
  }

  // ============================================
  // ORDER MANAGEMENT
  // ============================================

  /**
   * Get all orders with search, filter by status, and pagination.
   */
  async getAllOrders(queryObj) {
    const {
      search,
      status,
      paymentStatus,
      sort = '-createdAt',
      page = 1,
      limit = 10,
    } = queryObj;

    const query = {};

    if (search) {
      // Search by order ID or user name/email
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        query._id = search;
      }
    }

    if (status) {
      query.orderStatus = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'name email avatar'),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get full order details by ID.
   */
  async getOrderDetails(orderId) {
    const order = await Order.findById(orderId)
      .populate('user', 'name email phone avatar address');

    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    return order;
  }

  /**
   * Update order status with valid transitions.
   */
  async updateOrderStatus(orderId, status) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    await order.updateStatus(status);
    return order;
  }

  /**
   * Cancel an order and restore product stock.
   */
  async cancelOrder(orderId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    if (order.orderStatus === 'delivered') {
      throw new ApiError('Cannot cancel a delivered order', 400);
    }

    if (order.orderStatus === 'cancelled') {
      throw new ApiError('Order is already cancelled', 400);
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    // Create notification
    await this._createNotification('order_cancelled', 'Order Cancelled', `Order #${order._id.toString().slice(-8)} has been cancelled by admin`, { orderId: order._id });

    return order;
  }

  // ============================================
  // TRANSACTIONS
  // ============================================

  /**
   * Get transactions with date range filters.
   */
  async getTransactions(queryObj) {
    const {
      startDate,
      endDate,
      paymentStatus,
      paymentMethod,
      sort = '-createdAt',
      page = 1,
      limit = 10,
    } = queryObj;

    const query = {};

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Order.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .select('user totalPrice paymentMethod paymentStatus razorpayPaymentId createdAt orderStatus')
        .populate('user', 'name email'),
      Order.countDocuments(query),
    ]);

    return {
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get transaction statistics.
   */
  async getTransactionStats(queryObj = {}) {
    const { startDate, endDate } = queryObj;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = end;
      }
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalPrice', 0] },
          },
          successfulPayments: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] },
          },
          failedPayments: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'failed'] }, 1, 0] },
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] },
          },
          refunds: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'refunded'] }, 1, 0] },
          },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    return stats.length > 0 ? stats[0] : {
      totalRevenue: 0,
      successfulPayments: 0,
      failedPayments: 0,
      pendingPayments: 0,
      refunds: 0,
      totalTransactions: 0,
    };
  }

  // ============================================
  // ANALYTICS
  // ============================================

  /**
   * Get revenue analytics (monthly/daily).
   */
  async getRevenueAnalytics(period = 'monthly') {
    if (period === 'daily') {
      return this._getDailyData('revenue', 30);
    }
    return this._getMonthlyData('revenue');
  }

  /**
   * Get order analytics (monthly/daily).
   */
  async getOrderAnalytics(period = 'monthly') {
    if (period === 'daily') {
      return this._getDailyData('orders', 30);
    }
    return this._getMonthlyData('orders');
  }

  /**
   * Get user registration analytics.
   */
  async getUserAnalytics() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const data = await User.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Fill in missing months
    const result = [];
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = data.find((item) => item._id.year === year && item._id.month === month);
      result.push({
        label: `${monthNames[month - 1]} ${year}`,
        value: found ? found.count : 0,
      });
    }

    return result;
  }

  /**
   * Get top selling products by quantity sold.
   */
  async getTopSellingProducts(limit = 10) {
    const data = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit, 10) },
    ]);

    return data;
  }

  /**
   * Get top categories by revenue.
   */
  async getTopCategories(limit = 10) {
    const data = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$categoryInfo._id',
          name: { $first: '$categoryInfo.name' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalOrders: { $sum: 1 },
        },
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit, 10) },
    ]);

    return data;
  }

  /**
   * Get monthly growth percentages.
   */
  async getMonthlyGrowth() {
    const revenueData = await this._getMonthlyData('revenue');
    const ordersData = await this._getMonthlyData('orders');

    const calculateGrowth = (data) => {
      return data.map((item, index) => {
        if (index === 0 || data[index - 1].value === 0) {
          return { ...item, growth: 0 };
        }
        const growth = ((item.value - data[index - 1].value) / data[index - 1].value) * 100;
        return { ...item, growth: Math.round(growth * 10) / 10 };
      });
    };

    return {
      revenue: calculateGrowth(revenueData),
      orders: calculateGrowth(ordersData),
    };
  }

  /**
   * Helper: Get daily aggregated data for the last N days.
   */
  async _getDailyData(type, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const matchStage = { createdAt: { $gte: startDate } };
    if (type === 'revenue') {
      matchStage.paymentStatus = 'paid';
      matchStage.orderStatus = { $ne: 'cancelled' };
    }

    const data = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          ...(type === 'revenue'
            ? { total: { $sum: '$totalPrice' } }
            : { total: { $sum: 1 } }),
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Fill in missing days
    const result = [];
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const found = data.find(
        (item) => item._id.year === year && item._id.month === month && item._id.day === day
      );
      result.push({
        label: `${day}/${month}`,
        value: found ? found.total : 0,
      });
    }

    return result;
  }

  // ============================================
  // REVIEWS
  // ============================================

  /**
   * Get all reviews with pagination.
   */
  async getAllReviews(queryObj) {
    const {
      rating,
      isApproved,
      sort = '-createdAt',
      page = 1,
      limit = 10,
    } = queryObj;

    const query = {};
    if (rating) query.rating = parseInt(rating, 10);
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'name email avatar')
        .populate('product', 'name images'),
      Review.countDocuments(query),
    ]);

    return {
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Delete a review and recalculate product rating.
   */
  async deleteReview(reviewId) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ApiError('Review not found', 404);
    }

    const productId = review.product;
    await Review.findByIdAndDelete(reviewId);

    // Recalculate product rating
    await Review.calcAverageRating(productId);

    return true;
  }

  /**
   * Toggle review approval status.
   */
  async toggleReviewApproval(reviewId) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ApiError('Review not found', 404);
    }

    review.isApproved = !review.isApproved;
    await review.save();

    return review;
  }

  /**
   * Toggle review spam flag.
   */
  async toggleReviewSpam(reviewId) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ApiError('Review not found', 404);
    }

    review.isSpam = !review.isSpam;
    if (review.isSpam) {
      review.isApproved = false;
    }
    await review.save();

    return review;
  }

  // ============================================
  // COUPONS
  // ============================================

  /**
   * Create a new coupon.
   */
  async createCoupon(couponData) {
    // Check for duplicate code
    const existing = await Coupon.findOne({ code: couponData.code?.toUpperCase() });
    if (existing) {
      throw new ApiError(`Coupon code '${couponData.code}' already exists`, 400);
    }

    const coupon = await Coupon.create(couponData);
    return coupon;
  }

  /**
   * Get all coupons with pagination.
   */
  async getCoupons(queryObj) {
    const { page = 1, limit = 10, sort = '-createdAt' } = queryObj;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [coupons, total] = await Promise.all([
      Coupon.find({}).sort(sort).skip(skip).limit(limitNum),
      Coupon.countDocuments({}),
    ]);

    return {
      coupons,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Update a coupon.
   */
  async updateCoupon(couponId, updateData) {
    // Check code uniqueness if updating code
    if (updateData.code) {
      const existing = await Coupon.findOne({
        code: updateData.code.toUpperCase(),
        _id: { $ne: couponId },
      });
      if (existing) {
        throw new ApiError(`Coupon code '${updateData.code}' already exists`, 400);
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      throw new ApiError('Coupon not found', 404);
    }

    return coupon;
  }

  /**
   * Delete a coupon.
   */
  async deleteCoupon(couponId) {
    const coupon = await Coupon.findByIdAndDelete(couponId);
    if (!coupon) {
      throw new ApiError('Coupon not found', 404);
    }
    return true;
  }

  /**
   * Toggle coupon active status.
   */
  async toggleCouponStatus(couponId) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new ApiError('Coupon not found', 404);
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return coupon;
  }

  // ============================================
  // NOTIFICATIONS
  // ============================================

  /**
   * Get notifications with pagination.
   */
  async getNotifications(queryObj) {
    const { page = 1, limit = 20, isRead } = queryObj;

    const query = {};
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Notification.countDocuments(query),
    ]);

    return {
      notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Mark a single notification as read.
   */
  async markNotificationRead(notificationId) {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new ApiError('Notification not found', 404);
    }

    return notification;
  }

  /**
   * Mark all notifications as read.
   */
  async markAllNotificationsRead() {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    return true;
  }

  /**
   * Get unread notification count.
   */
  async getUnreadNotificationCount() {
    return await Notification.countDocuments({ isRead: false });
  }

  /**
   * Helper: Create a notification.
   */
  async _createNotification(type, title, message, data = {}) {
    try {
      await Notification.create({ type, title, message, data });
    } catch (err) {
      // Log but don't throw — notifications are non-critical
      console.error('Failed to create notification:', err.message);
    }
  }
}

module.exports = new AdminService();
