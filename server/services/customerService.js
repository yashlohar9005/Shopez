const Order = require('../models/Order');
const Product = require('../models/Product');
const Wishlist = require('../models/Wishlist');
const Address = require('../models/Address');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');

class CustomerService {
  // ============================================
  // DASHBOARD & ANALYTICS
  // ============================================

  async getDashboardSummary(userId) {
    const [
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      spendingAgg,
      wishlistAgg,
      addressesCount
    ] = await Promise.all([
      Order.countDocuments({ user: userId }),
      Order.countDocuments({ user: userId, orderStatus: 'pending' }),
      Order.countDocuments({ user: userId, orderStatus: 'delivered' }),
      Order.countDocuments({ user: userId, orderStatus: 'cancelled' }),
      Order.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId.toString()), paymentStatus: 'paid' } },
        { $group: { _id: null, totalSpent: { $sum: '$totalPrice' } } }
      ]),
      Wishlist.findOne({ user: userId }),
      Address.countDocuments({ user: userId })
    ]);

    const totalSpent = spendingAgg[0]?.totalSpent || 0;
    const wishlistCount = wishlistAgg ? wishlistAgg.products.length : 0;

    return {
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalSpent,
      wishlistCount,
      addressesCount
    };
  }

  async getPurchaseAnalytics(userId) {
    const objectId = new mongoose.Types.ObjectId(userId.toString());

    const [spendingTimeline, categoryDistribution, basicStats] = await Promise.all([
      // Monthly spending
      Order.aggregate([
        { $match: { user: objectId, paymentStatus: 'paid' } },
        { 
          $group: { 
            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
            totalSpent: { $sum: '$totalPrice' },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      // Category Distribution
      Order.aggregate([
        { $match: { user: objectId } },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productDetails' } },
        { $unwind: '$productDetails' },
        { $lookup: { from: 'categories', localField: 'productDetails.category', foreignField: '_id', as: 'categoryDetails' } },
        { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
        { $group: { _id: '$categoryDetails.name', count: { $sum: '$items.quantity' } } }
      ]),
      // Basic Stats
      Order.aggregate([
        { $match: { user: objectId, paymentStatus: 'paid' } },
        { $unwind: '$items' },
        { $group: { 
          _id: null, 
          totalProductsPurchased: { $sum: '$items.quantity' },
          totalSpent: { $sum: '$totalPrice' },
          avgOrderValue: { $avg: '$totalPrice' }
        }}
      ])
    ]);

    // Format Monthly Spending
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlySpending = spendingTimeline.map(item => ({
      label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      spent: item.totalSpent,
      orders: item.orderCount
    }));

    const categories = categoryDistribution.map(item => ({
      label: item._id || 'Uncategorized',
      value: item.count
    }));

    const stats = basicStats[0] || { totalProductsPurchased: 0, totalSpent: 0, avgOrderValue: 0 };

    return {
      monthlySpending,
      categoryDistribution: categories,
      stats
    };
  }

  // ============================================
  // WISHLIST
  // ============================================

  async getWishlist(userId) {
    let wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: 'products.product',
      select: 'name price images stock category'
    });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }
    return wishlist;
  }

  async addToWishlist(userId, productId) {
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    const exists = wishlist.products.find(p => p.product.toString() === productId);
    if (!exists) {
      wishlist.products.push({ product: productId });
      await wishlist.save();
    }
    
    return this.getWishlist(userId);
  }

  async removeFromWishlist(userId, productId) {
    await Wishlist.updateOne(
      { user: userId },
      { $pull: { products: { product: productId } } }
    );
    return this.getWishlist(userId);
  }

  // ============================================
  // ADDRESSES
  // ============================================

  async getAddresses(userId) {
    return Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  async addAddress(userId, addressData) {
    const address = new Address({ ...addressData, user: userId });
    await address.save();
    return this.getAddresses(userId);
  }

  async updateAddress(userId, addressId, addressData) {
    const address = await Address.findOneAndUpdate(
      { _id: addressId, user: userId },
      addressData,
      { new: true, runValidators: true }
    );
    if (!address) throw new ApiError(404, 'Address not found');
    
    // If setting as default, pre-save hook handles unsetting others
    if (addressData.isDefault) {
      await address.save(); 
    }
    
    return this.getAddresses(userId);
  }

  async deleteAddress(userId, addressId) {
    await Address.findOneAndDelete({ _id: addressId, user: userId });
    return this.getAddresses(userId);
  }

  // ============================================
  // RECOMMENDATIONS
  // ============================================

  async getRecommendations(userId) {
    // Simply fetch some trending products or recent ones for now
    // In a real app, this would use collaborative filtering based on orders
    const recommended = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('name price images category stock rating numReviews');
    
    return recommended;
  }
}

module.exports = new CustomerService();
