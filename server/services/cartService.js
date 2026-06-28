/**
 * @file backend/services/cartService.js
 * @description Business logic for shopping cart management
 */

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const ApiError = require('../utils/ApiError');

class CartService {
  /**
   * Get user's cart (create if it doesn't exist)
   */
  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId })
      .populate('items.product', 'name images price stock brand category')
      .populate('savedForLater.product', 'name images price stock brand category')
      .populate('coupon');
    
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    
    return cart;
  }

  /**
   * Add item to cart
   */
  async addItemToCart(userId, productId, quantity = 1) {
    // 1. Verify product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      throw new ApiError('Product not found or inactive', 404);
    }

    // 2. Check stock
    if (product.stock < quantity) {
      throw new ApiError(`Only ${product.stock} items left in stock`, 400);
    }

    // 3. Get or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // 4. Check if a coupon is active to recalculate discount
    if (cart.coupon) {
      await this._recalculateDiscount(cart);
    } else {
      await cart.addItem(productId, quantity, product.price);
    }

    // 5. Return populated cart
    return this.getCart(userId);
  }

  /**
   * Update item quantity in cart
   */
  async updateItemQuantity(userId, itemId, quantity) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new ApiError('Cart not found', 404);
    }

    // Find the item to check product stock
    const item = cart.items.id(itemId);
    if (!item) {
      throw new ApiError('Item not found in cart', 404);
    }

    const product = await Product.findById(item.product);
    if (!product || product.stock < quantity) {
      throw new ApiError('Requested quantity exceeds available stock', 400);
    }

    // Update via instance method
    await cart.updateItemQuantity(itemId, quantity);
    
    if (cart.coupon) {
      await this._recalculateDiscount(cart);
    }
    
    return this.getCart(userId);
  }

  /**
   * Remove item from cart
   */
  async removeItemFromCart(userId, itemId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new ApiError('Cart not found', 404);
    }

    // Remove via instance method
    await cart.removeItem(itemId);
    
    if (cart.coupon) {
      await this._recalculateDiscount(cart);
    }
    
    return this.getCart(userId);
  }
  /**
   * Helper to recalculate discount after cart changes
   */
  async _recalculateDiscount(cart) {
    if (!cart.coupon) return;
    const coupon = await Coupon.findById(cart.coupon);
    if (!coupon || !coupon.isActive || coupon.isExpired) {
      cart.coupon = null;
      cart.discountPrice = 0;
      await cart.save();
      return;
    }
    // Subtotal hasn't been saved yet by pre-save hook, calculate manually for discount validation
    const subTotal = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);
    
    if (subTotal < coupon.minPurchase) {
      cart.coupon = null;
      cart.discountPrice = 0;
    } else {
      if (coupon.type === 'percentage') {
        let disc = (subTotal * coupon.discount) / 100;
        if (coupon.maxDiscount && disc > coupon.maxDiscount) {
          disc = coupon.maxDiscount;
        }
        cart.discountPrice = disc;
      } else {
        cart.discountPrice = coupon.discount;
      }
    }
    await cart.save();
  }

  /**
   * Apply a coupon to the cart
   */
  async applyCoupon(userId, code) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      throw new ApiError('Cart is empty', 400);
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) throw new ApiError('Invalid coupon code', 404);
    if (!coupon.isValid) throw new ApiError('Coupon is expired or usage limit reached', 400);

    const subTotal = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);
    if (subTotal < coupon.minPurchase) {
      throw new ApiError(`Minimum purchase amount for this coupon is ₹${coupon.minPurchase}`, 400);
    }

    cart.coupon = coupon._id;
    await cart.save(); // pre-save won't calculate discount, so we do it in the helper
    await this._recalculateDiscount(cart);

    return this.getCart(userId);
  }

  /**
   * Move item to Saved For Later
   */
  async moveToSavedForLater(userId, itemId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new ApiError('Cart not found', 404);

    const item = cart.items.id(itemId);
    if (!item) throw new ApiError('Item not found in cart', 404);

    // Push to savedForLater
    cart.savedForLater.push({ product: item.product, quantity: item.quantity, price: item.price });
    // Remove from items
    item.deleteOne();
    
    if (cart.coupon) await this._recalculateDiscount(cart);
    else await cart.save();

    return this.getCart(userId);
  }

  /**
   * Move item from Saved For Later to Cart
   */
  async moveToCart(userId, itemId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new ApiError('Cart not found', 404);

    const savedItem = cart.savedForLater.id(itemId);
    if (!savedItem) throw new ApiError('Item not found in Saved For Later', 404);

    // Add back to cart
    await cart.addItem(savedItem.product, savedItem.quantity, savedItem.price);
    // Remove from savedForLater
    savedItem.deleteOne();

    if (cart.coupon) await this._recalculateDiscount(cart);
    else await cart.save();

    return this.getCart(userId);
  }
}

module.exports = new CartService();
