/**
 * @file backend/routes/productRoutes.js
 * @description Routes for product management
 */

const express = require('express');
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const { protect } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/adminMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createProductValidation,
  updateProductValidation,
} = require('../validations/productValidation');
const cacheMiddleware = require('../middleware/cacheMiddleware');

// Public routes
router.route('/')
  .get(cacheMiddleware(300), getProducts);

router.route('/:id')
  .get(cacheMiddleware(300), getProduct);

// Private/Admin routes
router.use(protect);
router.use(authorizeAdmin);

router.route('/')
  .post(createProductValidation, validate, createProduct);

router.route('/:id')
  .put(updateProductValidation, validate, updateProduct)
  .delete(deleteProduct);

module.exports = router;
