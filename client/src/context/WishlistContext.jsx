import React, { createContext, useState, useEffect } from 'react';
import customerApiService from '../services/customerApiService';
import useAuth from '../hooks/useAuth';

export const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch wishlist when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist({ products: [] });
      setWishlistIds(new Set());
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const data = await customerApiService.getWishlist();
      const productsList = Array.isArray(data) ? data : data?.products || [];
      setWishlist({ products: productsList });
      
      // Store IDs for quick lookup
      const ids = new Set(productsList.map(item => 
        item.product ? (item.product._id || item.product) : item._id
      ));
      setWishlistIds(ids);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to wishlist');
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await customerApiService.addToWishlist(productId);
      const productsList = Array.isArray(data) ? data : data?.products || [];
      setWishlist({ products: productsList });
      
      const ids = new Set(productsList.map(item => 
        item.product ? (item.product._id || item.product) : item._id
      ));
      setWishlistIds(ids);
      return true;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerApiService.removeFromWishlist(productId);
      const productsList = Array.isArray(data) ? data : data?.products || [];
      setWishlist({ products: productsList });
      
      const ids = new Set(productsList.map(item => 
        item.product ? (item.product._id || item.product) : item._id
      ));
      setWishlistIds(ids);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistIds.has(productId);
  };

  const value = {
    wishlist,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    fetchWishlist,
    itemCount: wishlistIds.size
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
