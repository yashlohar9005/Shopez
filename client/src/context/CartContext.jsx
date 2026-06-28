import React, { createContext, useState, useEffect } from 'react';
import cartService from '../services/cartService';
import useAuth from '../hooks/useAuth';

export const CartContext = createContext(null);

const emptyCart = { items: [], totalPrice: 0, itemCount: 0 };

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart when user logs in or app loads if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Clear cart on logout
      setCart(emptyCart);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await cartService.getCart();
      // cartService returns the cart object directly (api interceptor already unwraps response.data)
      if (data) {
        setCart(data);
      } else {
        setCart(emptyCart);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      // Depending on error, we might not want to crash the UI, just show empty
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart');
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.addToCart(productId, quantity);
      if (data) {
        setCart(data);
      }
      return true;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.updateCartItem(itemId, quantity);
      if (data) {
        setCart(data);
      }
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.removeCartItem(itemId);
      if (data) {
        setCart(data);
      }
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setCart(emptyCart);
  };

  const applyCoupon = async (code) => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.applyCoupon(code);
      if (data) setCart(data);
      return true;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const moveToSavedForLater = async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.moveToSavedForLater(itemId);
      if (data) setCart(data);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const moveToCart = async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.moveToCart(itemId);
      if (data) setCart(data);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    applyCoupon,
    moveToSavedForLater,
    moveToCart,
    itemCount: cart?.itemCount || 0
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
