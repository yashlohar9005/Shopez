/**
 * @file backend/models/Category.js
 * @description SHOPEZ Category Model — Mongoose Schema.
 *
 * Stores product categories for catalog organization and filtering.
 *
 * Features:
 * - Unique category name with case-insensitive matching
 * - Auto-generated URL-friendly slug from the name (pre-save hook)
 * - Optional description and image (Cloudinary URL)
 * - Soft-delete support via isActive flag
 * - Timestamps: createdAt, updatedAt (auto-managed)
 *
 * Indexes:
 * - { name: 1 } — unique, for fast lookups
 * - { slug: 1 } — unique, for URL-friendly routes
 *
 * Virtual:
 * - productCount — number of products in this category (requires populate)
 *
 * @requires mongoose
 */

const mongoose = require('mongoose');

// ============================================
// Category Schema
// ============================================
const categorySchema = new mongoose.Schema(
  {
    // --- Category Name (unique) ---
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },

    // --- Description ---
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },

    // --- URL-friendly Slug ---
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // --- Category Image (Cloudinary URL) ---
    image: {
      type: String,
      default: '',
    },

    // --- Active Status (soft-delete support) ---
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

// Name unique index — already created by unique: true, defining for clarity
categorySchema.index({ name: 1 }, { unique: true, name: 'idx_category_name' });

// Slug unique index — for URL-friendly lookups
categorySchema.index({ slug: 1 }, { unique: true, name: 'idx_category_slug' });

// Active categories filter — common query pattern
categorySchema.index({ isActive: 1 }, { name: 'idx_category_active' });

// ============================================
// Pre-Save Hook: Generate Slug
// ============================================

/**
 * Auto-generate a URL-friendly slug from the category name.
 * Runs only when the name field is new or modified.
 *
 * Transformation:
 * - Convert to lowercase
 * - Replace spaces and special characters with hyphens
 * - Remove consecutive hyphens
 * - Trim leading/trailing hyphens
 *
 * @example
 * "Electronics & Gadgets" → "electronics-gadgets"
 * "Men's Clothing" → "mens-clothing"
 */
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/-+/g, '-')            // Remove consecutive hyphens
      .replace(/^-|-$/g, '');          // Trim leading/trailing hyphens
  }
  next();
});

// ============================================
// Pre-findOneAndUpdate Hook: Regenerate Slug
// ============================================

/**
 * Regenerate slug when category name is updated via findOneAndUpdate.
 * This ensures the slug stays in sync with the name during updates.
 */
categorySchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();

  if (update.name || (update.$set && update.$set.name)) {
    const newName = update.name || update.$set.name;
    const newSlug = newName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (update.$set) {
      update.$set.slug = newSlug;
    } else {
      update.slug = newSlug;
    }
  }
  next();
});

// ============================================
// Virtual: Product Count
// ============================================

/**
 * Virtual populate — get the count of products in this category.
 * Must be explicitly populated in queries.
 *
 * @example
 * const category = await Category.findById(id).populate('products');
 */
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true, // Only returns the count, not the actual documents
});

// ============================================
// Export Model
// ============================================
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
