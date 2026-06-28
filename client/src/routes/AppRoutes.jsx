import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

// Route Protectors
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Public Pages
import Home from '../pages/Home';
import Products from '../pages/Products';
import ProductDetails from '../pages/ProductDetails';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ReturnPolicy from '../pages/ReturnPolicy';
import PrivacyPolicy from '../pages/PrivacyPolicy';

import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Profile from '../pages/Profile';
import Orders from '../pages/Orders';
import OrderDetails from '../pages/OrderDetails';
import PaymentSuccess from '../pages/PaymentSuccess';
import PaymentFailure from '../pages/PaymentFailure';

// New Customer Portal Pages
import CustomerLayout from '../layouts/CustomerLayout';
import CustomerDashboard from '../pages/user/CustomerDashboard';
import OrderHistory from '../pages/user/OrderHistory';
import Wishlist from '../pages/user/Wishlist';
import PurchaseAnalytics from '../pages/user/PurchaseAnalytics';
import SavedAddresses from '../pages/user/SavedAddresses';
import ProfileSettings from '../pages/user/ProfileSettings';
import TransactionHistory from '../pages/user/TransactionHistory';
import Invoice from '../pages/user/Invoice';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageProducts from '../pages/admin/ManageProducts';
import CreateProduct from '../pages/admin/CreateProduct';
import EditProduct from '../pages/admin/EditProduct';
import ManageOrders from '../pages/admin/ManageOrders';
import AdminOrderDetails from '../pages/admin/AdminOrderDetails';
import ManageUsers from '../pages/admin/ManageUsers';
import Inventory from '../pages/admin/Inventory';
import ManageCategories from '../pages/admin/ManageCategories';
import Transactions from '../pages/admin/Transactions';
import Analytics from '../pages/admin/Analytics';
import ManageReviews from '../pages/admin/ManageReviews';
import ManageCoupons from '../pages/admin/ManageCoupons';
import Notifications from '../pages/admin/Notifications';
import AdminProfile from '../pages/admin/AdminProfile';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public & User Routes using MainLayout */}
      <Route element={<MainLayout />}>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        
        {/* Protected User Pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          
          {/* Legacy links that now redirect to the new Customer Portal */}
          <Route path="/profile" element={<CustomerLayout />}>
            <Route index element={<CustomerDashboard />} />
          </Route>
          <Route path="/orders" element={<CustomerLayout />}>
            <Route index element={<OrderHistory />} />
          </Route>
          
          {/* New Customer Portal Routes */}
          <Route path="/account" element={<CustomerLayout />}>
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="analytics" element={<PurchaseAnalytics />} />
            <Route path="addresses" element={<SavedAddresses />} />
            <Route path="settings" element={<ProfileSettings />} />
            <Route path="transactions" element={<TransactionHistory />} />
          </Route>

          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/invoice/:id" element={<Invoice />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
        </Route>
      </Route>

      {/* Admin Routes using AdminLayout */}
      <Route element={<AdminLayout />}>
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<ManageProducts />} />
          <Route path="/admin/product/create" element={<CreateProduct />} />
          <Route path="/admin/product/:id/edit" element={<EditProduct />} />
          <Route path="/admin/orders" element={<ManageOrders />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/inventory" element={<Inventory />} />
          <Route path="/admin/categories" element={<ManageCategories />} />
          <Route path="/admin/transactions" element={<Transactions />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/reviews" element={<ManageReviews />} />
          <Route path="/admin/coupons" element={<ManageCoupons />} />
          <Route path="/admin/notifications" element={<Notifications />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>
      </Route>

      {/* 404 Catch All */}
      <Route path="*" element={
        <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
          <h1 className="display-1 fw-bold text-primary">404</h1>
          <h2>Page Not Found</h2>
          <a href="/" className="btn btn-primary mt-3">Go Home</a>
        </div>
      } />
    </Routes>
  );
};

export default AppRoutes;
