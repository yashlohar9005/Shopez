import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import customerApiService from '../../services/customerApiService';
import Loader from '../../components/Loader';
import RecommendationSection from '../../components/user/RecommendationSection';

const CustomerDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await customerApiService.getDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error("Failed to load dashboard summary", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <Loader />;
  if (!summary) return <div className="alert alert-danger">Error loading dashboard</div>;

  return (
    <div>
      <h3 className="fw-bold mb-4">My Dashboard</h3>
      
      {/* Overview Cards */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card shadow-sm border-0 h-100 bg-primary text-white text-center rounded-3">
            <div className="card-body py-4">
              <i className="bi bi-bag-check fs-1 mb-2 opacity-50"></i>
              <h6 className="text-white-50">Total Orders</h6>
              <h2 className="mb-0 fw-bold">{summary.totalOrders}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card shadow-sm border-0 h-100 bg-info text-white text-center rounded-3">
            <div className="card-body py-4">
              <i className="bi bi-wallet2 fs-1 mb-2 opacity-50"></i>
              <h6 className="text-white-50">Total Spent</h6>
              <h2 className="mb-0 fw-bold">₹{summary.totalSpent.toLocaleString()}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card shadow-sm border-0 h-100 bg-success text-white text-center rounded-3">
            <div className="card-body py-4">
              <i className="bi bi-heart fs-1 mb-2 opacity-50"></i>
              <h6 className="text-white-50">Wishlist Items</h6>
              <h2 className="mb-0 fw-bold">{summary.wishlistCount}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">Order Status</h6>
              <Link to="/account/orders" className="small text-decoration-none">View All</Link>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span className="text-muted"><i className="bi bi-hourglass-split me-2 text-warning"></i>Pending Orders</span>
                  <span className="badge bg-warning rounded-pill text-dark">{summary.pendingOrders}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span className="text-muted"><i className="bi bi-truck me-2 text-info"></i>Delivered Orders</span>
                  <span className="badge bg-success rounded-pill">{summary.deliveredOrders}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span className="text-muted"><i className="bi bi-x-circle me-2 text-danger"></i>Cancelled Orders</span>
                  <span className="badge bg-danger rounded-pill">{summary.cancelledOrders}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">Account Info</h6>
              <Link to="/account/settings" className="small text-decoration-none">Edit Profile</Link>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span className="text-muted"><i className="bi bi-geo-alt me-2 text-primary"></i>Saved Addresses</span>
                  <span className="badge bg-primary rounded-pill">{summary.addressesCount}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <span className="text-muted"><i className="bi bi-award me-2 text-success"></i>Reward Points</span>
                  <span className="badge bg-light text-success border border-success rounded-pill fw-bold">1200</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <RecommendationSection />
    </div>
  );
};

export default CustomerDashboard;
