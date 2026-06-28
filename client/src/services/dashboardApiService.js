import api from './api';

const dashboardApiService = {
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },
  getRevenue: async () => {
    const response = await api.get('/dashboard/revenue');
    return response.data;
  },
  getOrders: async () => {
    const response = await api.get('/dashboard/orders');
    return response.data;
  },
  getProducts: async () => {
    const response = await api.get('/dashboard/products');
    return response.data;
  },
  getCustomers: async () => {
    const response = await api.get('/dashboard/customers');
    return response.data;
  },
  getInventory: async () => {
    const response = await api.get('/dashboard/inventory');
    return response.data;
  },
  getActivity: async () => {
    const response = await api.get('/dashboard/activity');
    return response.data;
  },
  getAnalytics: async () => {
    const response = await api.get('/dashboard/analytics');
    return response.data;
  }
};

export default dashboardApiService;
