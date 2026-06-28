import api from './api';

const customerApiService = {
  // Dashboard & Analytics
  getDashboardSummary: async () => {
    const response = await api.get('/customer/dashboard');
    return response.data;
  },
  getPurchaseAnalytics: async () => {
    const response = await api.get('/customer/analytics');
    return response.data;
  },
  getRecommendations: async () => {
    const response = await api.get('/customer/recommendations');
    return response.data;
  },

  // Orders
  getOrders: async (params = {}) => {
    const response = await api.get('/customer/orders', { params });
    return response.data;
  },
  getOrderById: async (id) => {
    const response = await api.get(`/customer/orders/${id}`);
    return response.data;
  },

  // Wishlist
  getWishlist: async () => {
    const response = await api.get('/customer/wishlist');
    return response.data;
  },
  addToWishlist: async (productId) => {
    const response = await api.post('/customer/wishlist', { productId });
    return response.data;
  },
  removeFromWishlist: async (productId) => {
    const response = await api.delete(`/customer/wishlist/${productId}`);
    return response.data;
  },

  // Addresses
  getAddresses: async () => {
    const response = await api.get('/customer/addresses');
    return response.data;
  },
  addAddress: async (addressData) => {
    const response = await api.post('/customer/addresses', addressData);
    return response.data;
  },
  updateAddress: async (id, addressData) => {
    const response = await api.put(`/customer/addresses/${id}`, addressData);
    return response.data;
  },
  deleteAddress: async (id) => {
    const response = await api.delete(`/customer/addresses/${id}`);
    return response.data;
  }
};

export default customerApiService;
