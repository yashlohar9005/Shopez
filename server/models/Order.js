/**
 * @file backend/models/Order.js
 * @description SHOPEZ Order Model — Mongoose Schema.
 *
 * Stores completed orders with embedded order items, shipping details,
 * payment information, and order lifecycle status tracking.
 *
 * Features:
 * - Embedded order items (immutable product snapshots at purchase time)
 * - Shipping address with full details
 * - Razorpay payment integration fields
 * - Order status lifecycle: processing → shipped → delivered (or cancelled)
 * - Payment status: pending → paid → failed
 * - Auto-calculated pricing: totalPrice, taxPrice, shippingPrice
 * - Timestamps: createdAt, updatedAt (auto-managed)
 *
 * Indexes:
 * - { user: 1 } — fetch user's order history
 * - { orderStatus: 1 } — admin filter by status
 * - { createdAt: -1 } — sort by newest
 * - { razorpayOrderId: 1 } — payment verification lookup
 *
 * Design Decision: Order items are EMBEDDED (not referenced) because:
 * - Orders are immutable records — product prices/names should be frozen
 * - An order item only makes sense within its order context
 * - Products may change or be deleted, but order history must persist
 *
 * @requires mongoose
 */

const mongoose = require('mongoose');

// ============================================
// Shipping Address Sub-Schema (embedded)
// ============================================
const shippingAddressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City name cannot exceed 100 characters'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [100, 'State name cannot exceed 100 characters'],
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true,
      match: [/^[0-9]{5,10}$/, 'Zip code must be 5-10 digits'],
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country name cannot exceed 100 characters'],
      default: 'India',
    },
  },
  { _id: false }
);

// ============================================
// Order Item Sub-Schema (embedded)
// ============================================
const orderItemSchema = new mongoose.Schema(
  {
    // --- Product Reference (for linking back to product page) ---
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },

    // --- Snapshot Fields (frozen at purchase time) ---
    // These fields are copied from the product document at order creation.
    // Even if the product is later modified or deleted, the order record remains accurate.
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Product image is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
  },
  { _id: false }
);

// ============================================
// Order Schema
// ============================================
const orderSchema = new mongoose.Schema(
  {
    // --- User Reference ---
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },

    // --- Order Items (embedded snapshots) ---
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (val) {
          return val.length > 0;
        },
        message: 'Order must have at least one item',
      },
    },

    // --- Shipping Address ---
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, 'Shipping address is required'],
    },

    // --- Billing Address ---
    billingAddress: {
      type: shippingAddressSchema,
      required: [true, 'Billing address is required'],
    },

    // --- Payment Information ---
    paymentMethod: {
      type: String,
      enum: {
        values: ['Razorpay', 'COD', 'Wallet'],
        message: 'Payment method must be "Razorpay", "COD", or "Wallet"',
      },
      default: 'Razorpay',
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'failed', 'refunded'],
        message: 'Payment status must be pending, paid, failed, or refunded',
      },
      default: 'pending',
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },

    // --- Pricing ---
    itemsPrice: {
      type: Number,
      min: [0, 'Items price cannot be negative'],
      default: 0,
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      default: 0,
    },
    taxPrice: {
      type: Number,
      default: 0,
      min: [0, 'Tax price cannot be negative'],
    },
    shippingPrice: {
      type: Number,
      default: 0,
      min: [0, 'Shipping price cannot be negative'],
    },
    totalPrice: {
      type: Number,
      min: [0, 'Total price cannot be negative'],
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
      min: [0, 'Shipping price cannot be negative'],
    },
    totalPrice: {
      type: Number,
      min: [0, 'Total price cannot be negative'],
      default: 0,
    },

    // --- Order Status ---
    orderStatus: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded'],
        message: 'Order status must be pending, confirmed, processing, shipped, out_for_delivery, delivered, cancelled, returned, or refunded',
      },
      default: 'pending',
    },

    // --- Delivery Option ---
    deliveryOption: {
      type: String,
      enum: {
        values: ['Standard', 'Express'],
        message: 'Delivery option must be Standard or Express',
      },
      default: 'Standard',
    },

    // --- Special Instructions / Order Notes ---
    orderNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Order notes cannot exceed 500 characters'],
      default: '',
    },

    // --- Invoice ---
    invoiceId: {
      type: String,
      default: null,
    },

    // --- Timestamps for status changes ---
    confirmedAt: {
      type: Date,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    shippedAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
  },
  {
    // Automatically add createdAt and updatedAt fields
    timestamps: true,

    // Include virtuals in JSON and Object conversions
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// Indexes
// ============================================

// User's order history — fetched frequently
orderSchema.index({ user: 1, createdAt: -1 }, { name: 'idx_order_user_date' });

// Admin filter by order status
orderSchema.index({ orderStatus: 1 }, { name: 'idx_order_status' });

// Payment verification lookup
orderSchema.index({ razorpayOrderId: 1 }, { name: 'idx_order_razorpay', sparse: true });

// Newest orders — default sort
orderSchema.index({ createdAt: -1 }, { name: 'idx_order_created' });

// Payment status filter
orderSchema.index({ paymentStatus: 1 }, { name: 'idx_order_payment_status' });

// ============================================
// Pre-Save Hook: Calculate Prices
// ============================================

/**
 * Auto-calculate pricing before saving:
 * - itemsPrice: sum of (item.price × item.quantity)
 * - taxPrice: 18% GST on itemsPrice
 * - shippingPrice: ₹0 if itemsPrice >= ₹500, otherwise ₹49
 * - totalPrice: itemsPrice + taxPrice + shippingPrice
 */
orderSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('items')) {
    // Generate Invoice ID if not exists
    if (!this.invoiceId) {
      this.invoiceId = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // Calculate items subtotal
    this.itemsPrice = this.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    const afterDiscount = this.itemsPrice - this.discountPrice;

    // Calculate 18% GST tax
    this.taxPrice = Math.round(afterDiscount * 0.18 * 100) / 100;

    // Shipping price rules
    let baseShipping = afterDiscount >= 500 ? 0 : 49;
    if (this.deliveryOption === 'Express') {
      baseShipping += 100; // Extra for express
    }
    this.shippingPrice = baseShipping;

    // Calculate total
    this.totalPrice = Math.round(
      (afterDiscount + this.taxPrice + this.shippingPrice) * 100
    ) / 100;
  }

  next();
});

// ============================================
// Instance Methods
// ============================================

/**
 * Mark order as paid after successful Razorpay verification.
 *
 * @param {string} razorpayPaymentId - Razorpay payment ID
 * @param {string} razorpaySignature - Razorpay signature
 * @returns {Promise<Order>} The updated order document
 */
orderSchema.methods.markAsPaid = function (razorpayPaymentId, razorpaySignature) {
  this.paymentStatus = 'paid';
  this.razorpayPaymentId = razorpayPaymentId;
  this.razorpaySignature = razorpaySignature;
  this.paidAt = new Date();
  return this.save();
};

/**
 * Update the order status with timestamp tracking.
 *
 * @param {string} status - New order status
 * @returns {Promise<Order>} The updated order document
 * @throws {Error} If invalid status transition is attempted
 */
orderSchema.methods.updateStatus = function (status) {
  // Define valid transitions
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered', 'cancelled'],
    delivered: ['returned'],       
    returned: ['refunded'],
    refunded: [],
    cancelled: [],       // Final state — no further transitions
  };

  const allowedStatuses = validTransitions[this.orderStatus];

  if (!allowedStatuses || !allowedStatuses.includes(status)) {
    const error = new Error(
      `Cannot transition from "${this.orderStatus}" to "${status}"`
    );
    error.statusCode = 400;
    throw error;
  }

  this.orderStatus = status;

  // Set corresponding timestamp
  switch (status) {
    case 'confirmed':
      this.confirmedAt = new Date();
      break;
    case 'shipped':
      this.shippedAt = new Date();
      break;
    case 'delivered':
      this.deliveredAt = new Date();
      break;
    case 'cancelled':
      this.cancelledAt = new Date();
      break;
    case 'returned':
      this.returnedAt = new Date();
      break;
    case 'refunded':
      this.refundedAt = new Date();
      break;
  }

  return this.save();
};

// ============================================
// Virtual: Items Count
// ============================================

/**
 * Total number of individual items in the order.
 *
 * @returns {number} Sum of all item quantities
 */
orderSchema.virtual('totalItems').get(function () {
  if (!this.items) return 0;
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

// ============================================
// Static Method: Get User Orders
// ============================================

/**
 * Get paginated orders for a specific user.
 *
 * @param {string} userId - The user's ObjectId
 * @param {number} [page=1] - Page number
 * @param {number} [limit=10] - Items per page
 * @returns {Promise<Object>} { orders, pagination }
 */
orderSchema.statics.getUserOrders = async function (userId, page = 1, limit = 10) {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    this.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email'),
    this.countDocuments({ user: userId }),
  ]);

  return {
    orders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

// ============================================
// Export Model
// ============================================
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
