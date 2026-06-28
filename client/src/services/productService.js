import api from './api';

/**
 * Product API Service
 * Wraps all product related API calls.
 */
const productService = {
  /**
   * Get all products with optional filters
   * @param {Object} params - Query parameters (search, category, sort, page, limit)
   */
  getProducts: async (params = {}) => {
    // Convert params object to query string format
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await api.get(`/products${queryString}`);
    return response.data; // { products, pagination }
  },

  /**
   * Get a single product by ID
   * @param {string} id 
   */
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Get all categories
   */
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  }
};

export default productService;
