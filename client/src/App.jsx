import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="app">
            <AppRoutes />
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
