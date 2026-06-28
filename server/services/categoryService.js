/**
 * @file backend/services/categoryService.js
 * @description Business logic for category management
 */

const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');

class CategoryService {
  /**
   * Create a new category
   */
  async createCategory(categoryData) {
    // Check if category name already exists
    const existingCategory = await Category.findOne({ name: categoryData.name });
    if (existingCategory) {
      throw new ApiError(`Category with name '${categoryData.name}' already exists`, 400);
    }

    const category = await Category.create(categoryData);
    return category;
  }

  /**
   * Get all active categories
   */
  async getCategories() {
    // Only return active categories, sorted by name
    return await Category.find({ isActive: true }).sort({ name: 1 });
  }

  /**
   * Get a single category by ID
   */
  async getCategoryById(categoryId) {
    const category = await Category.findOne({ _id: categoryId, isActive: true });
    if (!category) {
      throw new ApiError('Category not found', 404);
    }
    return category;
  }

  /**
   * Update category
   */
  async updateCategory(categoryId, updateData) {
    const category = await Category.findById(categoryId);
    
    if (!category || !category.isActive) {
      throw new ApiError('Category not found', 404);
    }

    // If updating name, check for duplicates
    if (updateData.name && updateData.name !== category.name) {
      const existingCategory = await Category.findOne({ name: updateData.name });
      if (existingCategory) {
        throw new ApiError(`Category with name '${updateData.name}' already exists`, 400);
      }
    }

    // Mongoose findOneAndUpdate is used to trigger the pre('findOneAndUpdate') hook for slug generation
    const updatedCategory = await Category.findOneAndUpdate(
      { _id: categoryId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return updatedCategory;
  }

  /**
   * Soft delete category
   */
  async deleteCategory(categoryId) {
    const category = await Category.findById(categoryId);
    
    if (!category || !category.isActive) {
      throw new ApiError('Category not found', 404);
    }

    // Soft delete: set isActive to false instead of removing from DB
    category.isActive = false;
    await category.save();
    
    return true;
  }
}

module.exports = new CategoryService();
