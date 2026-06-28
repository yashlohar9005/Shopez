import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

/**
 * Custom hook to consume CartContext.
 * Ensures the hook is used within a CartProvider.
 */
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};

export default useCart;
