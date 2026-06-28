/**
 * @file backend/models/Notification.js
 * @description SHOPEZ Notification Model — Mongoose Schema.
 *
 * Stores admin notifications for important events such as new orders,
 * low stock alerts, new user registrations, and payment failures.
 *
 * Features:
 * - Typed notifications (new_order, low_stock, new_user, failed_payment, refund_request)
 * - Read/unread tracking
 * - Flexible data field for event-specific metadata
 * - Auto-sorted by newest first
 * - Timestamps: createdAt, updatedAt (auto-managed)
 *
 * Indexes:
 * - { isRead: 1, createdAt: -1 } — unread notifications sorted by newest
 * - { type: 1 } — filter by notification type
 *
 * @requires mongoose
 */

const mongoose = require('mongoose');

// ============================================
// Notification Schema
// ============================================
const notificationSchema = new mongoose.Schema(
  {
    // --- Notification Type ---
    type: {
      type: String,
      enum: {
        values: ['new_order', 'low_stock', 'new_user', 'failed_payment', 'refund_request', 'order_cancelled', 'system'],
        message: 'Invalid notification type',
      },
      required: [true, 'Notification type is required'],
    },

    // --- Title ---
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    // --- Message ---
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },

    // --- Flexible Metadata (event-specific data) ---
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // --- Read Status ---
    isRead: {
      type: Boolean,
      default: false,
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
notificationSchema.index({ isRead: 1, createdAt: -1 }, { name: 'idx_notification_read_date' });
notificationSchema.index({ type: 1 }, { name: 'idx_notification_type' });
notificationSchema.index({ createdAt: -1 }, { name: 'idx_notification_created' });

// ============================================
// Export Model
// ============================================
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
