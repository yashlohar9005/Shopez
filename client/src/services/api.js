import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
  // In development, this points to the Vite proxy or full backend URL
  // We use relative path so Vite proxy (if set in vite.config.js) can handle it,
  // or default to localhost:5000 if not proxied.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
// Automatically attaches the JWT token from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
// Automatically handles global errors (like 401 Unauthorized token expiry)
api.interceptors.response.use(
  (response) => {
    // If the backend wraps the data in { success, data, message }, we can unwrap it here
    // But to be safe and allow components to see the full response, we just return data
    return response.data;
  },
  (error) => {
    // Check if the error is 401 Unauthorized (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if we get a 401
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Optionally trigger a custom event that AuthContext can listen to
      window.dispatchEvent(new Event('auth_unauthorized'));
    }

    // Format error message for easier consumption by components
    const message = 
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      'An unexpected error occurred';
    
    return Promise.reject(message);
  }
);

export default api;
