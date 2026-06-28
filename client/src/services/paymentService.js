import api from './api';

/**
 * Get Razorpay key
 * @returns {Promise<string>}
 */
const getRazorpayKey = async () => {
  const response = await api.get('/payment/key');
  return response.data?.key || response.key;
};

/**
 * Create a Razorpay order from a DB order
 * @param {string} orderId
 * @returns {Promise<Object>} Razorpay order object
 */
const createOrder = async (orderId) => {
  const response = await api.post('/payment/create-order', { orderId });
  return response.data;
};

/**
 * Verify Razorpay payment signature
 * @param {Object} paymentData
 * @returns {Promise<Object>} Success message
 */
const verifyPayment = async (paymentData) => {
  const response = await api.post('/payment/verify', paymentData);
  return response.data;
};

/**
 * Get all transactions
 * @returns {Promise<Array>} List of transactions
 */
const getTransactions = async () => {
  const response = await api.get('/payment/transactions');
  return response.data;
};

const paymentService = {
  getRazorpayKey,
  createOrder,
  verifyPayment,
  getTransactions,
};

export default paymentService;
