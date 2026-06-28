import api from './api';

/**
 * Order API Service
 * Wraps all order related API calls.
 */
const orderService = {
  /**
   * Create a new order from current cart
   * @param {Object} orderData - { shippingAddress, paymentMethod }
   */
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  /**
   * Get logged in user's orders
   * @param {Object} params - Query parameters (page, limit)
   */
  getUserOrders: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await api.get(`/orders${queryString}`);
    return response.data;
  },

  /**
   * Get a single order by ID
   * @param {string} id 
   */
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  /**
   * Get a single order by ID
   * @param {string} id 
   */
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },
  
  cancelOrder: async (orderId) => {
    const response = await api.patch(`/orders/${orderId}/cancel`);
    return response.data;
  },
  
  returnOrder: async (orderId) => {
    const response = await api.patch(`/orders/${orderId}/return`);
    return response.data;
  }
};

export default orderService;
