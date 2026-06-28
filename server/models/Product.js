/**
 * @file backend/models/Product.js
 * @description SHOPEZ Product Model — Mongoose Schema.
 *
 * Stores the product catalog with pricing, stock, images, and ratings.
 *
 * Features:
 * - Full-text search index on name and description
 * - Category reference (populated in queries)
 * - Multiple Cloudinary image URLs (max 5)
 * - Computed average rating and review count (updated by Review hooks)
 * - Brand field for additional filtering
 * - Soft-delete support via isActive flag
 * - Timestamps: createdAt, updatedAt (auto-managed)
 *
 * Indexes:
 * - { name: 'text', description: 'text' } — full-text search
 * - { category: 1 } — filter by category
 * - { price: 1 } — sort/filter by price
 * - { averageRating: -1 } — sort by top-rated
 * - { createdAt: -1 } — sort by newest
 * - { brand: 1 } — filter by brand
 *
 * @requires mongoose
 */

const mongoose = require('mongoose');

// ============================================
// Product Image Sub-Schema (embedded)
// ============================================
const productImageSchema = new mongoose.Schema(
  {
    // Cloudinary public ID — needed for deletion
    publicId: {
      type: String,
      required: [true, 'Image public ID is required'],
    },
    // Cloudinary secure URL — used for display
    url: {
      type: String,
      required: [true, 'Image URL is required'],
    },
  },
  { _id: false }
);

// ============================================
// Product Schema
// ============================================
const productSchema = new mongoose.Schema(
  {
    // --- Product Name ---
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters'],
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },

    // --- Description ---
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    // --- Price (in INR) ---
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      // Store prices with up to 2 decimal places
      set: (val) => Math.round(val * 100) / 100,
    },

    // --- Stock Quantity ---
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
      // Ensure stock is always an integer
      set: (val) => Math.floor(val),
    },

    // --- Category (reference) ---
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },

    // --- Brand ---
    brand: {
      type: String,
      trim: true,
      maxlength: [100, 'Brand name cannot exceed 100 characters'],
      default: '',
    },

    // --- Specifications ---
    specifications: {
      type: [
        {
          name: {
            type: String,
            required: [true, 'Specification name is required'],
            trim: true
          },
          value: {
            type: String,
            required: [true, 'Specification value is required'],
            trim: true
          }
        }
      ],
      default: []
    },

    // --- Product Images (Cloudinary) ---
    images: {
      type: [productImageSchema],
      validate: {
        validator: function (val) {
          return val.length <= 5;
        },
        message: 'A product can have at most 5 images',
      },
      default: [],
    },

    // --- Average Rating (computed from reviews) ---
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
      // Round to 1 decimal place
      set: (val) => Math.round(val * 10) / 10,
    },

    // --- Number of Reviews (computed from reviews) ---
    numReviews: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
    },

    // --- Active Status (soft-delete) ---
    isActive: {
      type: Boolean,
      default: true,
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

// Full-text search index — enables $text queries on name and description
// Name has higher weight (10) than description (5) for relevance ranking
productSchema.index(
  { name: 'text', description: 'text' },
  {
    name: 'idx_product_text_search',
    weights: { name: 10, description: 5 },
  }
);

// Category filter — frequently used in product listing pages
productSchema.index({ category: 1 }, { name: 'idx_product_category' });

// Price sort/filter — used for price range queries and sorting
productSchema.index({ price: 1 }, { name: 'idx_product_price' });

// Rating sort — used for "Top Rated" product queries (descending)
productSchema.index({ averageRating: -1 }, { name: 'idx_product_rating' });

// Newest products — used for "New Arrivals" queries (descending)
productSchema.index({ createdAt: -1 }, { name: 'idx_product_created' });

// Brand filter — used for brand-specific queries
productSchema.index({ brand: 1 }, { name: 'idx_product_brand' });

// Compound index — category + price (common filter + sort combination)
productSchema.index(
  { category: 1, price: 1 },
  { name: 'idx_product_category_price' }
);

// Active products only — frequently filtered
productSchema.index({ isActive: 1 }, { name: 'idx_product_active' });

// ============================================
// Virtual: In Stock Status
// ============================================

/**
 * Virtual property to check if the product is in stock.
 * Returns true if stock > 0, false otherwise.
 *
 * @returns {boolean} Whether the product is currently in stock
 */
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// ============================================
// Virtual: Reviews (reverse populate)
// ============================================

/**
 * Virtual populate — get all reviews for this product.
 * Must be explicitly populated in queries.
 *
 * @example
 * const product = await Product.findById(id).populate('reviews');
 */
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

// ============================================
// Static Method: Search Products
// ============================================

/**
 * Search products using MongoDB full-text search.
 * Searches across name and description fields.
 *
 * @param {string} query - The search keyword
 * @returns {Promise<Array>} Array of matching products sorted by text score
 *
 * @example
 * const results = await Product.searchProducts('wireless headphones');
 */
productSchema.statics.searchProducts = async function (query) {
  return this.find(
    { $text: { $search: query }, isActive: true },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .populate('category', 'name slug');
};

// ============================================
// Static Method: Get Products by Filters
// ============================================

/**
 * Get filtered and paginated products.
 *
 * @param {Object} filters - Filter options
 * @param {string} [filters.category] - Category ObjectId
 * @param {number} [filters.minPrice] - Minimum price
 * @param {number} [filters.maxPrice] - Maximum price
 * @param {number} [filters.rating] - Minimum average rating
 * @param {string} [filters.brand] - Brand name
 * @param {string} [filters.sort] - Sort field (prefix '-' for desc)
 * @param {number} [filters.page=1] - Page number
 * @param {number} [filters.limit=10] - Items per page
 * @returns {Promise<Object>} { products, pagination }
 */
productSchema.statics.getFilteredProducts = async function (filters = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    rating,
    brand,
    sort = '-createdAt',
    page = 1,
    limit = 10,
  } = filters;

  // Build query filter object
  const query = { isActive: true };

  if (category) query.category = category;
  if (brand) query.brand = new RegExp(brand, 'i');
  if (rating) query.averageRating = { $gte: Number(rating) };

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Calculate pagination
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  // Execute query and count in parallel
  const [products, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('category', 'name slug'),
    this.countDocuments(query),
  ]);

  return {
    products,
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
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
