/**
 * @file frontend/src/services/adminService.js
 * @description Frontend Admin API Service
 * Wraps all admin-specific API calls targeting /api/admin/*
 */

import api from './api';

const adminService = {
  // ==========================================
  // Dashboard
  // ==========================================
  getDashboardData: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // ==========================================
  // Users
  // ==========================================
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  toggleUserStatus: async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/block`);
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // ==========================================
  // Products
  // ==========================================
  getProducts: async (params = {}) => {
    const response = await api.get('/admin/products', { params });
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/admin/products', productData);
    return response.data;
  },

  updateProduct: async (productId, productData) => {
    const response = await api.put(`/admin/products/${productId}`, productData);
    return response.data;
  },

  deleteProduct: async (productId) => {
    const response = await api.delete(`/admin/products/${productId}`);
    return response.data;
  },
  
  updateProductStock: async (productId, change) => {
    const response = await api.patch(`/admin/products/${productId}/stock`, { change });
    return response.data;
  },
  
  bulkUpdateStock: async (items) => {
    const response = await api.post('/admin/products/bulk-stock', { items });
    return response.data;
  },

  // ==========================================
  // Inventory
  // ==========================================
  getInventory: async (params = {}) => {
    const response = await api.get('/admin/inventory', { params });
    return response.data;
  },

  // ==========================================
  // Categories
  // ==========================================
  getCategories: async () => {
    const response = await api.get('/admin/categories');
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/admin/categories', categoryData);
    return response.data;
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/admin/categories/${categoryId}`, categoryData);
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/admin/categories/${categoryId}`);
    return response.data;
  },

  // ==========================================
  // Orders
  // ==========================================
  getAllOrders: async (params = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  getOrderDetails: async (orderId) => {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await api.patch(`/admin/orders/${orderId}/status`, { status });
    return response.data;
  },

  cancelOrder: async (orderId) => {
    const response = await api.patch(`/admin/orders/${orderId}/cancel`);
    return response.data;
  },

  // ==========================================
  // Transactions
  // ==========================================
  getTransactions: async (params = {}) => {
    const response = await api.get('/admin/transactions', { params });
    return response.data;
  },

  getTransactionStats: async (params = {}) => {
    const response = await api.get('/admin/transactions/stats', { params });
    return response.data;
  },

  // ==========================================
  // Analytics
  // ==========================================
  getRevenueAnalytics: async (period = 'monthly') => {
    const response = await api.get(`/admin/analytics/revenue?period=${period}`);
    return response.data;
  },

  getOrderAnalytics: async (period = 'monthly') => {
    const response = await api.get(`/admin/analytics/orders?period=${period}`);
    return response.data;
  },

  getUserAnalytics: async () => {
    const response = await api.get('/admin/analytics/users');
    return response.data;
  },

  getTopSellingProducts: async (limit = 5) => {
    const response = await api.get(`/admin/analytics/top-products?limit=${limit}`);
    return response.data;
  },

  getTopCategories: async (limit = 5) => {
    const response = await api.get(`/admin/analytics/top-categories?limit=${limit}`);
    return response.data;
  },

  getMonthlyGrowth: async () => {
    const response = await api.get('/admin/analytics/growth');
    return response.data;
  },

  // ==========================================
  // Reviews
  // ==========================================
  getReviews: async (params = {}) => {
    const response = await api.get('/admin/reviews', { params });
    return response.data;
  },

  deleteReview: async (reviewId) => {
    const response = await api.delete(`/admin/reviews/${reviewId}`);
    return response.data;
  },

  toggleReviewApproval: async (reviewId) => {
    const response = await api.patch(`/admin/reviews/${reviewId}/approve`);
    return response.data;
  },
  
  toggleReviewSpam: async (reviewId) => {
    const response = await api.patch(`/admin/reviews/${reviewId}/spam`);
    return response.data;
  },

  // ==========================================
  // Coupons
  // ==========================================
  getCoupons: async (params = {}) => {
    const response = await api.get('/admin/coupons', { params });
    return response.data;
  },

  createCoupon: async (couponData) => {
    const response = await api.post('/admin/coupons', couponData);
    return response.data;
  },

  updateCoupon: async (couponId, couponData) => {
    const response = await api.put(`/admin/coupons/${couponId}`, couponData);
    return response.data;
  },

  deleteCoupon: async (couponId) => {
    const response = await api.delete(`/admin/coupons/${couponId}`);
    return response.data;
  },

  toggleCouponStatus: async (couponId) => {
    const response = await api.patch(`/admin/coupons/${couponId}/toggle`);
    return response.data;
  },

  // ==========================================
  // Notifications
  // ==========================================
  getNotifications: async (params = {}) => {
    const response = await api.get('/admin/notifications', { params });
    return response.data;
  },

  getUnreadNotificationCount: async () => {
    const response = await api.get('/admin/notifications/unread-count');
    return response.data;
  },

  markNotificationRead: async (notificationId) => {
    const response = await api.patch(`/admin/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllNotificationsRead: async () => {
    const response = await api.patch('/admin/notifications/read-all');
    return response.data;
  }
};

export default adminService;
