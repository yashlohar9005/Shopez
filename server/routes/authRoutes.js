/**
 * @file backend/routes/authRoutes.js
 * @description Routes for user authentication and profile
 */

const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} = require('../validations/authValidation');

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

// Private routes
router.use(protect); // Apply protect middleware to all routes below

router.route('/profile')
  .get(getProfile)
  .put(updateProfileValidation, validate, updateProfile);

router.put('/change-password', changePasswordValidation, validate, changePassword);

module.exports = router;
