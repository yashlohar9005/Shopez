/**
 * @file backend/models/Coupon.js
 * @description SHOPEZ Coupon Model — Mongoose Schema.
 *
 * Stores discount coupons for promotional offers.
 *
 * Features:
 * - Unique coupon code (uppercase, auto-transformed)
 * - Percentage or flat discount types
 * - Minimum purchase and maximum discount constraints
 * - Expiry date validation
 * - Usage limit tracking
 * - Enable/disable toggle via isActive flag
 * - Timestamps: createdAt, updatedAt (auto-managed)
 *
 * Indexes:
 * - { code: 1 } — unique, for fast coupon lookup
 * - { isActive: 1, expiryDate: 1 } — active coupon queries
 *
 * @requires mongoose
 */

const mongoose = require('mongoose');

// ============================================
// Coupon Schema
// ============================================
const couponSchema = new mongoose.Schema(
  {
    // --- Coupon Code (unique, uppercase) ---
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, 'Coupon code must be at least 3 characters'],
      maxlength: [20, 'Coupon code cannot exceed 20 characters'],
      match: [/^[A-Z0-9]+$/, 'Coupon code can only contain letters and numbers'],
    },

    // --- Discount Type ---
    type: {
      type: String,
      enum: {
        values: ['percentage', 'flat'],
        message: 'Discount type must be "percentage" or "flat"',
      },
      required: [true, 'Discount type is required'],
    },

    // --- Discount Value ---
    discount: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount cannot be negative'],
      validate: {
        validator: function (val) {
          // Percentage discount cannot exceed 100%
          if (this.type === 'percentage' && val > 100) return false;
          return true;
        },
        message: 'Percentage discount cannot exceed 100%',
      },
    },

    // --- Minimum Purchase Amount ---
    minPurchase: {
      type: Number,
      default: 0,
      min: [0, 'Minimum purchase cannot be negative'],
    },

    // --- Maximum Discount Amount (for percentage coupons) ---
    maxDiscount: {
      type: Number,
      default: null,
      min: [0, 'Maximum discount cannot be negative'],
    },

    // --- Expiry Date ---
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },

    // --- Usage Limit (total uses allowed, null = unlimited) ---
    usageLimit: {
      type: Number,
      default: null,
      min: [1, 'Usage limit must be at least 1'],
    },

    // --- Used Count ---
    usedCount: {
      type: Number,
      default: 0,
      min: [0, 'Used count cannot be negative'],
    },

    // --- Description ---
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },

    // --- Active Status ---
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// Indexes
// ============================================
couponSchema.index({ code: 1 }, { unique: true, name: 'idx_coupon_code' });
couponSchema.index({ isActive: 1, expiryDate: 1 }, { name: 'idx_coupon_active_expiry' });

// ============================================
// Virtual: Is Expired
// ============================================
couponSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiryDate;
});

// ============================================
// Virtual: Is Usage Limit Reached
// ============================================
couponSchema.virtual('isLimitReached').get(function () {
  if (this.usageLimit === null) return false;
  return this.usedCount >= this.usageLimit;
});

// ============================================
// Virtual: Is Valid (active, not expired, limit not reached)
// ============================================
couponSchema.virtual('isValid').get(function () {
  return this.isActive && !this.isExpired && !this.isLimitReached;
});

// ============================================
// Export Model
// ============================================
const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
