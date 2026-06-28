/**
 * @file backend/validations/orderValidation.js
 * @description Express-validator rules for Order routes
 */

const { body, param } = require('express-validator');

exports.createOrderValidation = [
  body('shippingAddress')
    .notEmpty()
    .withMessage('Shipping address is required')
    .isObject()
    .withMessage('Shipping address must be an object'),
  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('shippingAddress.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required')
    .matches(/^[0-9]{5,10}$/)
    .withMessage('Zip code must be 5-10 digits'),
  body('paymentMethod')
    .optional()
    .isIn(['Razorpay', 'COD'])
    .withMessage('Payment method must be Razorpay or COD'),
];

exports.updateOrderStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Order ID format'),
  body('status')
    .notEmpty()
    .withMessage('Order status is required')
    .isIn(['processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
];
