/**
 * @file backend/services/productService.js
 * @description Business logic for product management
 */

const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const ApiError = require('../utils/ApiError');

class ProductService {
  /**
   * Create a new product
   */
  async createProduct(productData) {
    // Verify category exists and is active
    const category = await Category.findOne({ _id: productData.category, isActive: true });
    if (!category) {
      throw new ApiError('Invalid category provided or category is inactive', 400);
    }

    const product = await Product.create(productData);
    return product;
  }

  /**
   * Get products with filtering, sorting, and pagination
   */
  async getProducts(queryObj) {
    // Determine if we are doing a text search or a filtered query
    if (queryObj.search) {
      // Use the static searchProducts method
      const products = await Product.searchProducts(queryObj.search);
      // Pagination could be applied here manually if needed, but for simplicity we return all search matches
      return {
        products,
        pagination: {
          page: 1,
          limit: products.length,
          total: products.length,
          pages: 1
        }
      };
    }

    // Use the static getFilteredProducts method for normal filtering
    return await Product.getFilteredProducts(queryObj);
  }

  /**
   * Get a single product by ID
   */
  async getProductById(productId) {
    const product = await Product.findOne({ _id: productId, isActive: true })
      .populate('category', 'name slug')
      .populate({
        path: 'reviews', // via reverse populate virtual
        select: 'rating comment user createdAt',
        populate: { path: 'user', select: 'name avatar' }
      });

    if (!product) {
      throw new ApiError('Product not found', 404);
    }
    
    return product;
  }

  /**
   * Update product
   */
  async updateProduct(productId, updateData) {
    // If updating category, verify it exists
    if (updateData.category) {
      const category = await Category.findOne({ _id: updateData.category, isActive: true });
      if (!category) {
        throw new ApiError('Invalid category provided or category is inactive', 400);
      }
    }

    const product = await Product.findOneAndUpdate(
      { _id: productId, isActive: true },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) {
      throw new ApiError('Product not found', 404);
    }

    return product;
  }

  /**
   * Soft delete product
   */
  async deleteProduct(productId) {
    const product = await Product.findById(productId);
    
    if (!product || !product.isActive) {
      throw new ApiError('Product not found', 404);
    }

    // Soft delete
    product.isActive = false;
    await product.save();
    
    return true;
  }
}

module.exports = new ProductService();
