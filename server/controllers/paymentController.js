const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get Razorpay Key
 * @route   GET /api/payment/key
 * @access  Private
 */
exports.getRazorpayKey = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, { key: process.env.RAZORPAY_KEY_ID }, 'Razorpay Key retrieved')
  );
});

/**
 * @desc    Create a Razorpay Order
 * @route   POST /api/payment/create-order
 * @access  Private
 */
exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    throw new ApiError(400, 'Order ID is required to create a payment session');
  }

  // Find the order in DB to get the exact amount
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Ensure user owns the order
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to pay for this order');
  }

  // If already paid, reject
  if (order.paymentStatus === 'paid') {
    throw new ApiError(400, 'Order is already paid');
  }
  
  if (order.paymentMethod === 'COD') {
    order.paymentStatus = 'pending';
    await order.updateStatus('confirmed');
    
    // Create Transaction Record
    await Transaction.create({
      transactionId: `TXN-COD-${Date.now()}`,
      user: req.user.id,
      order: order._id,
      amount: order.totalPrice,
      paymentMethod: 'COD',
      paymentStatus: 'pending',
      invoiceId: order.invoiceId
    });
    
    return res.status(200).json(new ApiResponse(200, { method: 'COD' }, 'COD Order Confirmed'));
  }

  // Razorpay requires amount in paise (multiply by 100)
  const amountInPaise = Math.round(order.totalPrice * 100);

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: `receipt_order_${order._id}`,
  };

  try {
    const razorpayOrder = await razorpayInstance.orders.create(options);
    
    // Save the razorpayOrderId to the DB order
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json(
      new ApiResponse(200, razorpayOrder, 'Razorpay order created successfully')
    );
  } catch (error) {
    throw new ApiError(500, `Failed to create Razorpay order: ${error.message}`);
  }
});

/**
 * @desc    Verify Razorpay Payment Signature
 * @route   POST /api/payment/verify
 * @access  Private
 */
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    throw new ApiError(400, 'Incomplete payment verification details');
  }

  // Find the order
  const order = await Order.findById(orderId);
  
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Construct expected signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  // Compare signatures
  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Payment verified successfully
    await order.markAsPaid(razorpay_payment_id, razorpay_signature);
    await order.updateStatus('confirmed');
    
    // Create transaction record
    await Transaction.create({
      transactionId: razorpay_payment_id,
      user: req.user.id,
      order: order._id,
      amount: order.totalPrice,
      paymentMethod: 'Razorpay',
      paymentStatus: 'success',
      invoiceId: order.invoiceId
    });
    
    res.status(200).json(
      new ApiResponse(200, { verified: true }, 'Payment verified successfully')
    );
  } else {
    // Signature mismatch
    order.paymentStatus = 'failed';
    await order.save();
    
    await Transaction.create({
      transactionId: razorpay_payment_id || `FAILED-${Date.now()}`,
      user: req.user.id,
      order: order._id,
      amount: order.totalPrice,
      paymentMethod: 'Razorpay',
      paymentStatus: 'failed',
      invoiceId: order.invoiceId
    });
    
    throw new ApiError(400, 'Invalid payment signature. Payment failed.');
  }
});

/**
 * @desc    Get Transaction History
 * @route   GET /api/payment/transactions
 * @access  Private
 */
exports.getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user.id })
    .populate('order', 'totalPrice orderStatus')
    .sort('-createdAt');
    
  res.status(200).json(new ApiResponse(200, transactions, 'Transactions fetched'));
});
