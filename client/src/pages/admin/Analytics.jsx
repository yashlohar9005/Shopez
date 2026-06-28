import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import RevenueChart from '../../components/admin/RevenueChart';
import OrdersChart from '../../components/admin/OrdersChart';
import Loader from '../../components/Loader';
import StatsCard from '../../components/admin/StatsCard';

const Analytics = () => {
  const [data, setData] = useState({
    growth: null,
    topProducts: [],
    topCategories: [],
    revenueMonthly: [],
    ordersMonthly: [],
    usersMonthly: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [growth, topProducts, topCategories, revMonth, ordMonth, usersMonth] = await Promise.all([
        adminService.getMonthlyGrowth(),
        adminService.getTopSellingProducts(5),
        adminService.getTopCategories(5),
        adminService.getRevenueAnalytics('monthly'),
        adminService.getOrderAnalytics('monthly'),
        adminService.getUserAnalytics()
      ]);

      setData({
        growth,
        topProducts,
        topCategories,
        revenueMonthly: revMonth,
        ordersMonthly: ordMonth,
        usersMonthly: usersMonth
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthIndicator = (growthArray) => {
    if (!growthArray || growthArray.length === 0) return { val: 0, icon: 'bi-dash', color: 'secondary' };
    const latest = growthArray[growthArray.length - 1].growth;
    if (latest > 0) return { val: latest, icon: 'bi-arrow-up-right', color: 'success' };
    if (latest < 0) return { val: Math.abs(latest), icon: 'bi-arrow-down-right', color: 'danger' };
    return { val: 0, icon: 'bi-dash', color: 'secondary' };
  };

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-danger shadow-sm border-0">{error}</div>;

  const revGrowth = getGrowthIndicator(data.growth?.revenue);
  const ordGrowth = getGrowthIndicator(data.growth?.orders);

  return (
    <div className="pb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 text-dark">Analytics Dashboard</h2>
          <p className="text-muted mb-0 small">Deep dive into store performance</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm shadow-sm" onClick={fetchAnalyticsData}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>

      {/* Growth Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 rounded-3 h-100 bg-white">
            <div className="card-body p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.8rem' }}>Revenue Growth (MoM)</h6>
                <div className="d-flex align-items-center">
                  <h2 className="fw-bold mb-0 me-3 text-dark">{revGrowth.val}%</h2>
                  <span className={`badge bg-${revGrowth.color} bg-opacity-10 text-${revGrowth.color} p-2 rounded-pill`}>
                    <i className={`bi ${revGrowth.icon} fs-6`}></i>
                  </span>
                </div>
              </div>
              <div className={`text-${revGrowth.color} opacity-25`}>
                <i className="bi bi-graph-up-arrow" style={{ fontSize: '4rem' }}></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0 rounded-3 h-100 bg-white">
            <div className="card-body p-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.8rem' }}>Orders Growth (MoM)</h6>
                <div className="d-flex align-items-center">
                  <h2 className="fw-bold mb-0 me-3 text-dark">{ordGrowth.val}%</h2>
                  <span className={`badge bg-${ordGrowth.color} bg-opacity-10 text-${ordGrowth.color} p-2 rounded-pill`}>
                    <i className={`bi ${ordGrowth.icon} fs-6`}></i>
                  </span>
                </div>
              </div>
              <div className={`text-${ordGrowth.color} opacity-25`}>
                <i className="bi bi-cart-check" style={{ fontSize: '4rem' }}></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 rounded-3 h-100">
            <div className="card-header bg-white border-bottom border-light py-3">
              <h6 className="mb-0 fw-bold">Revenue Analytics (Last 12 Months)</h6>
            </div>
            <div className="card-body">
              <RevenueChart data={data.revenueMonthly} />
            </div>
          </div>
        </div>
        
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 rounded-3 h-100">
            <div className="card-header bg-white border-bottom border-light py-3">
              <h6 className="mb-0 fw-bold">Orders Analytics (Last 12 Months)</h6>
            </div>
            <div className="card-body">
              <OrdersChart data={data.ordersMonthly} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Lists Row */}
      <div className="row g-4">
        {/* Top Products */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 rounded-3 h-100">
            <div className="card-header bg-white border-bottom border-light py-3">
              <h6 className="mb-0 fw-bold">Top 5 Selling Products</h6>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {data.topProducts.map((prod, index) => (
                  <li key={prod._id} className="list-group-item px-4 py-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="fs-5 fw-bold text-muted me-3" style={{ width: '20px' }}>#{index + 1}</div>
                      <img 
                        src={prod.image || 'https://via.placeholder.com/40'} 
                        alt={prod.name} 
                        className="rounded object-fit-cover me-3 border"
                        width="40" height="40" 
                      />
                      <div>
                        <h6 className="mb-0 text-truncate" style={{ maxWidth: '200px' }}>{prod.name}</h6>
                        <small className="text-muted">{prod.totalQuantity} units sold</small>
                      </div>
                    </div>
                    <div className="fw-bold text-success">
                      ₹{prod.totalRevenue.toLocaleString('en-IN')}
                    </div>
                  </li>
                ))}
                {data.topProducts.length === 0 && (
                  <li className="list-group-item text-center py-4 text-muted">Not enough data available.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 rounded-3 h-100">
            <div className="card-header bg-white border-bottom border-light py-3">
              <h6 className="mb-0 fw-bold">Top Categories By Revenue</h6>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {data.topCategories.map((cat, index) => (
                  <li key={cat._id} className="list-group-item px-4 py-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="fs-5 fw-bold text-muted me-3" style={{ width: '20px' }}>#{index + 1}</div>
                      <div>
                        <h6 className="mb-0">{cat.name}</h6>
                        <small className="text-muted">{cat.totalOrders} orders</small>
                      </div>
                    </div>
                    <div className="fw-bold text-primary">
                      ₹{cat.totalRevenue.toLocaleString('en-IN')}
                    </div>
                  </li>
                ))}
                {data.topCategories.length === 0 && (
                  <li className="list-group-item text-center py-4 text-muted">Not enough data available.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
