/**
 * @file backend/services/dashboardService.js
 * @description Service for all Live E-Commerce Dashboard analytics and aggregations.
 */

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');

class DashboardService {
  /**
   * Helper: Get start of today, week, month
   */
  _getDateRanges() {
    const now = new Date();
    
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday as start of week
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return { startOfToday, startOfWeek, startOfMonth };
  }

  // ============================================
  // SUMMARY API
  // ============================================
  async getSummary() {
    const { startOfToday, startOfMonth } = this._getDateRanges();

    const [
      totalUsers,
      activeUsers,
      totalProducts,
      totalCategories,
      totalOrders,
      ordersByStatus,
      revenueData,
      todayRevenueData,
      monthlyRevenueData,
      lowStockCount,
      outOfStockCount
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isBlocked: false }),
      Product.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      Order.countDocuments({}),
      // Orders by status
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
      ]),
      // Total Revenue
      Order.aggregate([
        { $match: { paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      // Today's Revenue
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday }, paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      // Monthly Revenue
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      // Stock counts
      Product.countDocuments({ isActive: true, stock: { $gt: 0, $lt: 5 } }),
      Product.countDocuments({ isActive: true, stock: 0 })
    ]);

    const formatStatus = (statusName) => {
      const found = ordersByStatus.find(s => s._id === statusName);
      return found ? found.count : 0;
    };

    return {
      users: { total: totalUsers, active: activeUsers },
      catalog: { products: totalProducts, categories: totalCategories },
      orders: {
        total: totalOrders,
        pending: formatStatus('pending'),
        processing: formatStatus('processing'),
        shipped: formatStatus('shipped'),
        delivered: formatStatus('delivered'),
        cancelled: formatStatus('cancelled')
      },
      revenue: {
        total: revenueData[0]?.total || 0,
        today: todayRevenueData[0]?.total || 0,
        monthly: monthlyRevenueData[0]?.total || 0,
      },
      inventory: {
        lowStock: lowStockCount,
        outOfStock: outOfStockCount
      }
    };
  }

  // ============================================
  // REVENUE API
  // ============================================
  async getRevenue() {
    const { startOfToday, startOfWeek, startOfMonth } = this._getDateRanges();

    // Reusing logic but adding AOV and Total Transactions
    const [stats, weekly, monthly, today] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalSales: { $sum: '$totalPrice' }, count: { $sum: 1 }, avgOrderValue: { $avg: '$totalPrice' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfWeek }, paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday }, paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ]);

    return {
      revenueToday: today[0]?.total || 0,
      revenueThisWeek: weekly[0]?.total || 0,
      revenueThisMonth: monthly[0]?.total || 0,
      totalSales: stats[0]?.totalSales || 0,
      averageOrderValue: stats[0]?.avgOrderValue || 0,
      totalTransactions: stats[0]?.count || 0
    };
  }

  // ============================================
  // ORDERS API
  // ============================================
  async getOrders() {
    const { startOfToday, startOfWeek, startOfMonth } = this._getDateRanges();

    const [today, weekly, monthly, byStatus] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }])
    ]);

    const formatStatus = (statusName) => {
      const found = byStatus.find(s => s._id === statusName);
      return found ? found.count : 0;
    };

    return {
      ordersToday: today,
      ordersThisWeek: weekly,
      ordersThisMonth: monthly,
      status: {
        pending: formatStatus('pending'),
        processing: formatStatus('processing'),
        delivered: formatStatus('delivered'),
        cancelled: formatStatus('cancelled')
      }
    };
  }

  // ============================================
  // PRODUCTS API
  // ============================================
  async getProducts() {
    const [bestSelling, recentlyAdded, lowStock, outOfStock] = await Promise.all([
      // Best Selling Products (Derived from Order Items)
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, name: { $first: '$items.name' }, image: { $first: '$items.image' } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
      ]),
      // Recently Added
      Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).select('name price stock images'),
      // Low Stock
      Product.find({ isActive: true, stock: { $gt: 0, $lt: 5 } }).select('name price stock images'),
      // Out of Stock
      Product.find({ isActive: true, stock: 0 }).select('name price stock images')
    ]);

    return {
      bestSelling,
      recentlyAdded,
      lowStock,
      outOfStock
    };
  }

  // ============================================
  // CUSTOMERS API
  // ============================================
  async getCustomers() {
    const { startOfMonth } = this._getDateRanges();

    const [newCustomers, returningCustomersData, recentRegistrations] = await Promise.all([
      User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
      Order.aggregate([
        { $group: { _id: '$user', orderCount: { $sum: 1 } } },
        { $match: { orderCount: { $gt: 1 } } },
        { $count: 'returning' }
      ]),
      User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('name email avatar createdAt')
    ]);

    const totalUsers = await User.countDocuments({ role: 'user' });
    const returningCustomers = returningCustomersData[0]?.returning || 0;

    return {
      newCustomersThisMonth: newCustomers,
      returningCustomers,
      totalCustomers: totalUsers,
      recentRegistrations
    };
  }

  // ============================================
  // ACTIVITY API
  // ============================================
  async getActivity() {
    // Fetch latest 5 of each and combine, then sort
    const [recentOrders, recentUsers, recentProducts] = await Promise.all([
      Order.find({}).sort({ createdAt: -1 }).limit(10).populate('user', 'name'),
      User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5),
      Product.find({}).sort({ createdAt: -1 }).limit(5)
    ]);

    let activities = [];

    recentOrders.forEach(o => {
      activities.push({
        id: `order_${o._id}`,
        type: 'order',
        title: `New Order Received`,
        description: `Order #${o._id.toString().substring(18)} placed by ${o.user?.name || 'Unknown'}`,
        timestamp: o.createdAt,
        status: o.orderStatus
      });
    });

    recentUsers.forEach(u => {
      activities.push({
        id: `user_${u._id}`,
        type: 'user',
        title: `New User Registered`,
        description: `${u.name} joined the platform`,
        timestamp: u.createdAt,
        status: 'success'
      });
    });

    recentProducts.forEach(p => {
      activities.push({
        id: `product_${p._id}`,
        type: 'product',
        title: `Product Added`,
        description: `${p.name} added to catalog`,
        timestamp: p.createdAt,
        status: p.stock > 0 ? 'info' : 'warning'
      });
    });

    // Sort descending by timestamp and take top 15
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return activities.slice(0, 15);
  }

  // ============================================
  // ANALYTICS (CHARTS) API
  // ============================================
  async getAnalytics() {
    // Generate last 6 months data for charts
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [monthlyRevenueData, categorySalesData, orderStatusData] = await Promise.all([
      // Monthly Sales Bar Chart
      Order.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo }, paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
        { $group: { 
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, 
            total: { $sum: '$totalPrice' } 
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      
      // Category Doughnut Chart (via Order Items)
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        // Since order items don't have category embedded natively, we do a lookup
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productDoc' } },
        { $unwind: '$productDoc' },
        { $lookup: { from: 'categories', localField: 'productDoc.category', foreignField: '_id', as: 'categoryDoc' } },
        { $unwind: '$categoryDoc' },
        { $group: { _id: '$categoryDoc.name', sales: { $sum: '$items.quantity' } } }
      ]),

      // Orders Status Pie Chart
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
      ])
    ]);

    // Format Monthly Data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = monthlyRevenueData.find(item => item._id.year === year && item._id.month === month);
      monthlyRevenue.push({
        label: `${monthNames[month - 1]} ${year}`,
        value: found ? found.total : 0
      });
    }

    // Format Category Data
    const categorySales = categorySalesData.map(c => ({
      label: c._id,
      value: c.sales
    }));

    // Format Status Data
    const orderStatus = orderStatusData.map(s => ({
      label: s._id,
      value: s.count
    }));

    return {
      monthlyRevenue,
      categorySales,
      orderStatus
    };
  }

  // ============================================
  // INVENTORY API
  // ============================================
  async getInventory() {
    const [totalProducts, lowStockProducts, outOfStockProducts, recentlyAdded, recentlyUpdated, inventoryValueResult] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Product.find({ isActive: true, stock: { $gt: 0, $lt: 5 } }).select('name price stock images').sort({ stock: 1 }),
      Product.find({ isActive: true, stock: 0 }).select('name price stock images'),
      Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).select('name price stock images createdAt'),
      Product.find({ isActive: true }).sort({ updatedAt: -1 }).limit(5).select('name price stock images updatedAt'),
      Product.aggregate([
        { $match: { isActive: true } },
        { $project: { itemValue: { $multiply: ['$price', '$stock'] } } },
        { $group: { _id: null, totalValue: { $sum: '$itemValue' } } }
      ])
    ]);

    return {
      totalInventory: totalProducts,
      lowStock: lowStockProducts,
      outOfStock: outOfStockProducts,
      recentlyAdded,
      recentlyUpdated,
      inventoryValue: inventoryValueResult[0]?.totalValue || 0
    };
  }
}

module.exports = new DashboardService();
