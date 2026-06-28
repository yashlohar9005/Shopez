/**
 * @file backend/models/User.js
 * @description SHOPEZ User Model — Mongoose Schema.
 *
 * Stores registered user accounts (customers and administrators).
 *
 * Features:
 * - Email uniqueness with case-insensitive matching (lowercase)
 * - Password hashing with bcryptjs (pre-save hook, 10 salt rounds)
 * - Instance method: comparePassword() — compares plain text with hash
 * - Instance method: generateAuthToken() — creates signed JWT
 * - Password field excluded from queries by default (select: false)
 * - Embedded address sub-document
 * - Role-based access: "user" (default) or "admin"
 * - Timestamps: createdAt, updatedAt (auto-managed)
 *
 * Indexes:
 * - { email: 1 } — unique, for fast login lookups
 *
 * @requires mongoose
 * @requires bcryptjs
 * @requires jsonwebtoken
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ============================================
// Address Sub-Schema (embedded in User)
// ============================================
const addressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters'],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City name cannot exceed 100 characters'],
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, 'State name cannot exceed 100 characters'],
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [20, 'Zip code cannot exceed 20 characters'],
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country name cannot exceed 100 characters'],
      default: 'India',
    },
  },
  { _id: false } // No separate _id for embedded sub-document
);

// ============================================
// User Schema
// ============================================
const userSchema = new mongoose.Schema(
  {
    // --- Name ---
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    // --- Email (unique, lowercase) ---
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },

    // --- Password (hashed, excluded from queries) ---
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Exclude from query results by default
    },

    // --- Role (user or admin) ---
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: 'Role must be either "user" or "admin"',
      },
      default: 'user',
    },

    // --- Blocked Status (admin can block users) ---
    isBlocked: {
      type: Boolean,
      default: false,
    },

    // --- Phone ---
    phone: {
      type: String,
      trim: true,
      match: [
        /^[0-9]{10,15}$/,
        'Phone number must be 10-15 digits',
      ],
    },

    // --- Avatar (Cloudinary URL) ---
    avatar: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/v1570564332/avatar.png',
    },

    // --- Address (embedded sub-document) ---
    address: addressSchema,
  },
  {
    // Automatically add createdAt and updatedAt fields
    timestamps: true,

    // Include virtuals when converting to JSON/Object
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// Indexes
// ============================================

// Email unique index is already created by the `unique: true` option above.
// Explicitly defining it for clarity and to set a custom name:
userSchema.index({ email: 1 }, { unique: true, name: 'idx_user_email' });

// ============================================
// Pre-Save Hook: Hash Password
// ============================================

/**
 * Hash the password before saving to the database.
 * Only runs when the password field is new or modified.
 * Uses bcryptjs with 10 salt rounds.
 */
userSchema.pre('save', async function (next) {
  // Skip hashing if password hasn't been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ============================================
// Instance Methods
// ============================================

/**
 * Compare a candidate password against the stored hashed password.
 *
 * @param {string} candidatePassword - The plain-text password to verify
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 *
 * @example
 * const user = await User.findById(id).select('+password');
 * const isMatch = await user.comparePassword('userInput123');
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Generate a signed JWT token for authentication.
 * Payload contains the user's ID and role.
 * Token expires based on the JWT_EXPIRE environment variable.
 *
 * @returns {string} Signed JWT token
 *
 * @example
 * const token = user.generateAuthToken();
 * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 */
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

// ============================================
// Virtual: Full Address (formatted)
// ============================================

/**
 * Virtual property that returns the user's address as a formatted string.
 * Not stored in the database — computed on access.
 *
 * @returns {string|null} Formatted address or null if no address set
 */
userSchema.virtual('fullAddress').get(function () {
  if (!this.address) return null;

  const parts = [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.zipCode,
    this.address.country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : null;
});

// ============================================
// Export Model
// ============================================
const User = mongoose.model('User', userSchema);

module.exports = User;
