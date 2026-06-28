/**
 * @file backend/models/Cart.js
 * @description SHOPEZ Cart Model — Mongoose Schema.
 *
 * Stores the shopping cart for each user with embedded cart items.
 * Each user has exactly one cart (enforced by unique index on user field).
 *
 * Features:
 * - One cart per user (unique constraint on user field)
 * - Embedded cart items with product reference, quantity, and price
 * - Auto-calculated totalPrice via pre-save hook
 * - Product reference populated in queries for display data
 * - Timestamps: createdAt, updatedAt (auto-managed)
 *
 * Indexes:
 * - { user: 1 } — unique, one cart per user + fast lookup
 *
 * Design Decision: Cart items are EMBEDDED (not referenced) because:
 * - A cart is always fetched as a complete unit
 * - Items are only meaningful within the context of a cart
 * - Embedding avoids expensive $lookup (join) operations
 *
 * @requires mongoose
 */

const mongoose = require('mongoose');

// ============================================
// Cart Item Sub-Schema (embedded in Cart)
// ============================================
const cartItemSchema = new mongoose.Schema(
  {
    // --- Product Reference ---
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },

    // --- Quantity ---
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
      // Ensure quantity is always an integer
      set: (val) => Math.floor(val),
    },

    // --- Price at time of adding to cart ---
    // Captured from product.price when item is added/updated.
    // This ensures price consistency during the shopping session.
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
  },
  {
    // Generate _id for each cart item (needed for item-level operations)
    _id: true,
    timestamps: false,
  }
);

// ============================================
// Cart Schema
// ============================================
const cartSchema = new mongoose.Schema(
  {
    // --- User Reference (one cart per user) ---
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true, // Enforces one cart per user
    },

    // --- Cart Items (embedded array) ---
    items: {
      type: [cartItemSchema],
      default: [],
    },

    // --- Saved For Later Items ---
    savedForLater: {
      type: [cartItemSchema],
      default: [],
    },

    // --- Applied Coupon ---
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },

    // --- Pricing Fields ---
    subTotal: {
      type: Number,
      default: 0,
      min: [0, 'Sub total cannot be negative'],
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: [0, 'Discount price cannot be negative'],
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
      default: 0,
      min: [0, 'Total price cannot be negative'],
    },
    
    // --- Estimated Delivery ---
    estimatedDelivery: {
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

// User unique index — one cart per user, fast lookup by userId
cartSchema.index({ user: 1 }, { unique: true, name: 'idx_cart_user' });

// ============================================
// Pre-Save Hook: Calculate Total Price
// ============================================

/**
 * Recalculate the totalPrice from cart items before every save.
 * totalPrice = sum of (item.quantity × item.price) for all items.
 *
 * This runs on every save, ensuring totalPrice is always accurate.
 */
cartSchema.pre('save', function (next) {
  // 1. Calculate items subTotal
  this.subTotal = this.items.reduce((total, item) => {
    return total + item.quantity * item.price;
  }, 0);
  this.subTotal = Math.round(this.subTotal * 100) / 100;

  // 2. Calculate Discount (logic for exact coupon calculation will be in service, 
  // but if discountPrice is set, we ensure it doesn't exceed subTotal)
  if (this.discountPrice > this.subTotal) {
    this.discountPrice = this.subTotal;
  }

  // 3. Calculate Tax (e.g. 18% of discounted subtotal)
  const afterDiscount = this.subTotal - this.discountPrice;
  this.taxPrice = Math.round(afterDiscount * 0.18 * 100) / 100;

  // 4. Calculate Shipping (Free if afterDiscount >= 500, else 49)
  if (this.items.length === 0) {
    this.shippingPrice = 0;
  } else {
    this.shippingPrice = afterDiscount >= 500 ? 0 : 49;
  }

  // 5. Calculate Final Total
  this.totalPrice = Math.round((afterDiscount + this.taxPrice + this.shippingPrice) * 100) / 100;

  // 6. Set default estimated delivery (5 days from now) if items exist
  if (this.items.length > 0 && !this.estimatedDelivery) {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    this.estimatedDelivery = deliveryDate;
  } else if (this.items.length === 0) {
    this.estimatedDelivery = null;
  }

  next();
});

// ============================================
// Virtual: Item Count
// ============================================

/**
 * Virtual property that returns the total number of individual items in the cart.
 * Sums up the quantity of all cart items.
 *
 * @returns {number} Total quantity of all items
 *
 * @example
 * // Cart has: Headphones (qty: 2) + Phone Case (qty: 1)
 * cart.itemCount // Returns: 3
 */
cartSchema.virtual('itemCount').get(function () {
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

// ============================================
// Instance Methods
// ============================================

/**
 * Add a product to the cart or increment its quantity if it already exists.
 *
 * @param {string} productId - The product's ObjectId
 * @param {number} quantity - Quantity to add
 * @param {number} price - Current product price
 * @returns {Promise<Cart>} The updated cart document
 */
cartSchema.methods.addItem = function (productId, quantity, price) {
  const existingItem = this.items.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingItem) {
    // Item exists — update quantity and price
    existingItem.quantity += quantity;
    existingItem.price = price; // Update to latest price
  } else {
    // New item — add to cart
    this.items.push({ product: productId, quantity, price });
  }

  return this.save();
};

/**
 * Update the quantity of a specific cart item.
 *
 * @param {string} itemId - The cart item's _id
 * @param {number} quantity - New quantity
 * @returns {Promise<Cart>} The updated cart document
 * @throws {Error} If item is not found in cart
 */
cartSchema.methods.updateItemQuantity = function (itemId, quantity) {
  const item = this.items.id(itemId);

  if (!item) {
    const error = new Error('Item not found in cart');
    error.statusCode = 404;
    throw error;
  }

  item.quantity = quantity;
  return this.save();
};

/**
 * Remove a specific item from the cart.
 *
 * @param {string} itemId - The cart item's _id
 * @returns {Promise<Cart>} The updated cart document
 * @throws {Error} If item is not found in cart
 */
cartSchema.methods.removeItem = function (itemId) {
  const item = this.items.id(itemId);

  if (!item) {
    const error = new Error('Item not found in cart');
    error.statusCode = 404;
    throw error;
  }

  item.deleteOne();
  return this.save();
};

/**
 * Clear all items from the cart.
 *
 * @returns {Promise<Cart>} The empty cart document
 */
cartSchema.methods.clearCart = function () {
  this.items = [];
  this.subTotal = 0;
  this.totalPrice = 0;
  this.discountPrice = 0;
  this.taxPrice = 0;
  this.shippingPrice = 0;
  this.coupon = null;
  this.estimatedDelivery = null;
  return this.save();
};

// ============================================
// Export Model
// ============================================
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
