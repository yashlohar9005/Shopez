const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort('-createdAt');
  
  res.status(200).json(new ApiResponse(200, users, 'Users retrieved successfully'));
});

/**
 * @desc    Update user role (Admin only)
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Prevent admin from changing their own role to user (could lock themselves out)
  if (user._id.toString() === req.user._id.toString() && req.body.role === 'user') {
    throw new ApiError(400, 'You cannot downgrade your own admin role');
  }

  user.role = req.body.role || user.role;
  await user.save();

  res.status(200).json(new ApiResponse(200, {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }, 'User role updated successfully'));
});

/**
 * @desc    Toggle user active/blocked status (Admin only)
 * @route   PUT /api/users/:id/status
 * @access  Private/Admin
 */
exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot block yourself');
  }

  if (user.role === 'admin') {
    throw new ApiError(400, 'Cannot block an admin');
  }

  // Toggle the isBlocked field
  user.isBlocked = !user.isBlocked;
  await user.save();

  res.status(200).json(new ApiResponse(200, {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isBlocked: user.isBlocked
  }, `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`));
});
