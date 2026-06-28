/**
 * @file backend/models/Review.js
 * @description SHOPEZ Review Model — Mongoose Schema.
 *
 * Stores product reviews and ratings submitted by users.
 *
 * Features:
 * - Compound unique index: one review per user per product
 * - Rating validation: 1–5 scale (integers only)
 * - Post-save hook: recalculates product averageRating and numReviews
 * - Post-remove hook: recalculates product stats after review deletion
 * - Static method: calcAverageRating() — MongoDB aggregation pipeline
 * - Timestamps: createdAt, updatedAt (auto-managed)
 *
 * Indexes:
 * - { product: 1, user: 1 } — compound unique (one review per user per product)
 * - { product: 1 } — fetch all reviews for a product
 * - { user: 1 } — fetch all reviews by a user
 * - { rating: 1 } — filter by rating
 *
 * @requires mongoose
 */

const mongoose = require('mongoose');

// ============================================
// Review Schema
// ============================================
const reviewSchema = new mongoose.Schema(
  {
    // --- User Reference (who wrote the review) ---
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },

    // --- Product Reference (which product was reviewed) ---
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },

    // --- Rating (1-5 stars) ---
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      // Ensure rating is an integer
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be a whole number (1-5)',
      },
    },

    // --- Review Comment ---
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [5, 'Comment must be at least 5 characters'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },

    // --- Approval Status (admin moderation) ---
    isApproved: {
      type: Boolean,
      default: true,
    },

    // --- Spam Flag (admin can flag reviews) ---
    isSpam: {
      type: Boolean,
      default: false,
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

// Compound unique index — prevents duplicate reviews (one per user per product)
reviewSchema.index(
  { product: 1, user: 1 },
  { unique: true, name: 'idx_review_product_user' }
);

// Product reviews — fetch all reviews for a specific product
reviewSchema.index({ product: 1 }, { name: 'idx_review_product' });

// User reviews — fetch all reviews by a specific user
reviewSchema.index({ user: 1 }, { name: 'idx_review_user' });

// Rating filter — filter reviews by rating value
reviewSchema.index({ rating: 1 }, { name: 'idx_review_rating' });

// ============================================
// Static Method: Calculate Average Rating
// ============================================

/**
 * Recalculate the average rating and review count for a product.
 * Uses MongoDB aggregation pipeline for accurate calculation.
 * Updates the Product document directly.
 *
 * Called automatically by post-save and post-remove hooks.
 *
 * @param {ObjectId} productId - The product's ObjectId
 * @returns {Promise<void>}
 *
 * @example
 * await Review.calcAverageRating(product._id);
 */
reviewSchema.statics.calcAverageRating = async function (productId) {
  const Product = mongoose.model('Product');

  // Aggregation pipeline to calculate stats
  const stats = await this.aggregate([
    // Stage 1: Match reviews for this product
    { $match: { product: productId } },

    // Stage 2: Calculate average rating and count
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    // Reviews exist — update product with calculated values
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  } else {
    // No reviews — reset product rating to defaults
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      numReviews: 0,
    });
  }
};

// ============================================
// Static Method: Get Product Reviews (Paginated)
// ============================================

/**
 * Get paginated reviews for a specific product.
 *
 * @param {string} productId - The product's ObjectId
 * @param {number} [page=1] - Page number
 * @param {number} [limit=10] - Items per page
 * @returns {Promise<Object>} { reviews, pagination, stats }
 */
reviewSchema.statics.getProductReviews = async function (productId, page = 1, limit = 10) {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  // Execute query, count, and rating distribution in parallel
  const [reviews, total, ratingDistribution] = await Promise.all([
    this.find({ product: productId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name avatar'),

    this.countDocuments({ product: productId }),

    // Rating distribution (how many 1-star, 2-star, etc.)
    this.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]),
  ]);

  // Format rating distribution as { 5: 10, 4: 8, 3: 5, 2: 2, 1: 1 }
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingDistribution.forEach((r) => {
    distribution[r._id] = r.count;
  });

  return {
    reviews,
    stats: {
      total,
      distribution,
    },
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

// ============================================
// Post-Save Hook: Update Product Rating
// ============================================

/**
 * After a new review is saved (created or updated),
 * recalculate the product's average rating and review count.
 */
reviewSchema.post('save', async function () {
  // `this` refers to the saved review document
  // `this.constructor` refers to the Review model
  await this.constructor.calcAverageRating(this.product);
});

// ============================================
// Post-Remove Hook: Update Product Rating
// ============================================

/**
 * After a review is deleted, recalculate the product's
 * average rating and review count.
 *
 * Handles both deleteOne() and findOneAndDelete() operations.
 */
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRating(doc.product);
  }
});

reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await this.constructor.calcAverageRating(this.product);
});

// ============================================
// Export Model
// ============================================
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
