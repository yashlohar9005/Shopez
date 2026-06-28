/**
 * @file backend/routes/categoryRoutes.js
 * @description Routes for category management
 */

const express = require('express');
const router = express.Router();

const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const { protect } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/adminMiddleware');
const validate = require('../middleware/validateMiddleware');
const { categoryValidation } = require('../validations/categoryValidation');
const cacheMiddleware = require('../middleware/cacheMiddleware');

// Public routes
router.route('/')
  .get(cacheMiddleware(300), getCategories);

router.route('/:id')
  .get(cacheMiddleware(300), getCategory);

// Private/Admin routes
router.use(protect);
router.use(authorizeAdmin);

router.route('/')
  .post(categoryValidation, validate, createCategory);

router.route('/:id')
  .put(categoryValidation, validate, updateCategory)
  .delete(deleteCategory);

module.exports = router;
