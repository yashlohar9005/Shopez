/**
 * @file backend/services/authService.js
 * @description Business logic for user authentication and profile management
 */

const User = require('../models/User');
const ApiError = require('../utils/ApiError');

class AuthService {
  /**
   * Register a new user
   */
  async registerUser(userData) {
    const { name, email, password } = userData;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ApiError('User already exists with this email', 400);
    }

    // Create user (password is hashed in pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate JWT token
    const token = user.generateAuthToken();

    // Return user data (excluding password) and token
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    };
  }

  /**
   * Login user
   */
  async loginUser(email, password) {
    // 1. Find user by email and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError('Invalid email or password', 401);
    }

    // 2. Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError('Invalid email or password', 401);
    }

    // 3. Generate token
    const token = user.generateAuthToken();

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    };
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Check if email is being updated and already exists
    if (updateData.email && updateData.email !== user.email) {
      const emailExists = await User.findOne({ email: updateData.email });
      if (emailExists) {
        throw new ApiError('Email is already in use by another account', 400);
      }
    }

    // Update fields
    user.name = updateData.name !== undefined ? updateData.name : user.name;
    user.email = updateData.email !== undefined ? updateData.email : user.email;
    user.phone = updateData.phone !== undefined ? updateData.phone : user.phone;
    
    // Address updates
    if (updateData.address) {
      user.address = {
        street: updateData.address.street !== undefined ? updateData.address.street : user.address?.street,
        city: updateData.address.city !== undefined ? updateData.address.city : user.address?.city,
        state: updateData.address.state !== undefined ? updateData.address.state : user.address?.state,
        zipCode: updateData.address.zipCode !== undefined ? updateData.address.zipCode : user.address?.zipCode,
        country: updateData.address.country !== undefined ? updateData.address.country : user.address?.country,
      };
    }

    // Update password if provided
    if (updateData.password) {
      user.password = updateData.password;
    }

    const updatedUser = await user.save();
    return updatedUser;
  }

  /**
   * Change user password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError('Incorrect current password', 401);
    }

    // Update password (will be hashed in pre-save hook)
    user.password = newPassword;
    await user.save();
    
    return true;
  }
}

module.exports = new AuthService();
