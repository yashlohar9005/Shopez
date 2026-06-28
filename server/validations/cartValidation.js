/**
 * @file backend/validations/cartValidation.js
 * @description Express-validator rules for Cart routes
 */

const { body, param } = require('express-validator');

exports.addToCartValidation = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid Product ID format'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
];

exports.updateCartItemValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Cart Item ID format'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
];

exports.removeCartItemValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Cart Item ID format'),
];
