/**
 * @file backend/services/orderService.js
 * @description Business logic for order management
 */

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

class OrderService {
  /**
   * Create a new order from user's cart
   */
  async createOrder(userId, orderData) {
    // 1. Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      throw new ApiError('Your cart is empty', 400);
    }

    // 2. Validate stock for all items
    for (const item of cart.items) {
      if (!item.product || item.product.stock < item.quantity) {
        const name = item.product ? item.product.name : 'Unknown Product';
        throw new ApiError(`Insufficient stock for ${name}`, 400);
      }
    }

    // 3. Prepare order items (snapshots)
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      // Get the first image or a default
      image: item.product.images.length > 0 ? item.product.images[0].url : '',
      // Use the current DB price to prevent tampering from frontend
      price: item.product.price,
      quantity: item.quantity
    }));

    // 4. Create the order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress || orderData.shippingAddress,
      deliveryOption: orderData.deliveryOption || 'Standard',
      paymentMethod: orderData.paymentMethod || 'Razorpay',
      discountPrice: cart.discountPrice || 0,
      orderNotes: orderData.orderNotes || '',
    });

    // 5. Reduce product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // 6. Clear user's cart
    await cart.clearCart();
    
    // 7. Create Notification
    try {
      await Notification.create({
        type: 'new_order',
        title: 'New Order Received',
        message: `Order #${order._id.toString().slice(-8).toUpperCase()} has been placed.`,
        data: { orderId: order._id, total: order.totalPrice }
      });
    } catch (err) {
      console.error('Failed to create notification', err);
    }

    return order;
  }

  /**
   * Get all orders for a specific user
   */
  async getUserOrders(userId, queryObj = {}) {
    const page = queryObj.page || 1;
    const limit = queryObj.limit || 10;
    
    return await Order.getUserOrders(userId, page, limit);
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId, userId, userRole) {
    const order = await Order.findById(orderId).populate('user', 'name email');
    
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    // Check if user is admin or the order belongs to them
    if (userRole !== 'admin' && order.user._id.toString() !== userId.toString()) {
      throw new ApiError('Not authorized to view this order', 403);
    }

    return order;
  }

  /**
   * Update order status (Admin only)
   */
  async updateOrderStatus(orderId, status) {
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    // Uses the model's instance method which validates transitions
    await order.updateStatus(status);
    
    return order;
  }

  /**
   * Cancel an order (User only, before shipping)
   */
  async cancelOrder(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw new ApiError('Order not found', 404);

    if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
      throw new ApiError('Cannot cancel an order that is already shipped or delivered', 400);
    }

    await order.updateStatus('cancelled');
    
    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    // Create Notification
    try {
      await Notification.create({
        type: 'order_cancelled',
        title: 'Order Cancelled',
        message: `Order #${order._id.toString().slice(-8).toUpperCase()} was cancelled by user.`,
        data: { orderId: order._id }
      });
    } catch (err) {
      console.error('Failed to create notification', err);
    }

    return order;
  }

  /**
   * Return an order (User only, after delivery)
   */
  async returnOrder(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw new ApiError('Order not found', 404);

    if (order.orderStatus !== 'delivered') {
      throw new ApiError('Can only return delivered orders', 400);
    }

    // Must be within 7 days
    const daysSinceDelivery = (new Date() - order.deliveredAt) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 7) {
      throw new ApiError('Return window (7 days) has expired', 400);
    }

    await order.updateStatus('returned');

    // Create Notification
    try {
      await Notification.create({
        type: 'refund_request',
        title: 'Return/Refund Requested',
        message: `User requested a return for Order #${order._id.toString().slice(-8).toUpperCase()}.`,
        data: { orderId: order._id }
      });
    } catch (err) {
      console.error('Failed to create notification', err);
    }

    return order;
  }
}

module.exports = new OrderService();
