import api from './api';

/**
 * Auth API Service
 * Wraps all authentication related API calls.
 */
const authService = {
  /**
   * Login user
   * @param {string} email
   * @param {string} password
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    // If successful, the interceptor returns the data portion: { success, data: { user, token }, message }
    // We want to store the token and return the user data
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Register new user
   * @param {Object} userData - { name, email, password }
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Get logged in user profile
   */
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} userData 
   */
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    
    // Update local storage with new user data
    if (response.success && response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  },

  /**
   * Logout user (client-side only since JWT is stateless)
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default authService;
