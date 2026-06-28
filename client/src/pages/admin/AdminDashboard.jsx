import React, { useState } from 'react';
import useLiveDashboard from '../../hooks/useLiveDashboard';
import Loader from '../../components/Loader';
import NotificationDropdown from '../../components/admin/NotificationDropdown';
import LiveSalesWidgets from '../../components/admin/LiveSalesWidgets';
import LiveInventoryWidgets from '../../components/admin/LiveInventoryWidgets';
import LiveOrderWidgets from '../../components/admin/LiveOrderWidgets';
import LiveCustomerWidgets from '../../components/admin/LiveCustomerWidgets';
import RevenueTrendChart from '../../components/admin/charts/RevenueTrendChart';
import OrdersStatusChart from '../../components/admin/charts/OrdersStatusChart';
import InventoryDoughnutChart from '../../components/admin/charts/InventoryDoughnutChart';
import TopSellingProductsChart from '../../components/admin/charts/TopSellingProductsChart';
import ActivityFeed from '../../components/admin/ActivityFeed';

const AdminDashboard = () => {
  const { data, loading, error, lastUpdated, refetch } = useLiveDashboard(30000); // 30 sec poll
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('sales');

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch(true);
    setIsRefreshing(false);
  };

  if (loading && !data.summary) return <Loader />;

  return (
    <div className="pb-5">
      {/* Header & Notifications */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 text-dark">Live Store Dashboard</h2>
          <p className="text-muted mb-0 small">
            Auto-updates every 30s • Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <button 
            className="btn btn-outline-secondary btn-sm shadow-sm" 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            <i className={`bi bi-arrow-clockwise me-1 ${isRefreshing ? 'spinner-border spinner-border-sm' : ''}`}></i> 
            Refresh
          </button>
          <NotificationDropdown />
        </div>
      </div>

      {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}

      {/* Modular Navigation Tabs */}
      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'sales' ? 'active shadow-sm' : 'bg-white text-dark border'}`} onClick={() => setActiveTab('sales')}>
            <i className="bi bi-graph-up me-2"></i> Sales & Revenue
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'inventory' ? 'active shadow-sm' : 'bg-white text-dark border'}`} onClick={() => setActiveTab('inventory')}>
            <i className="bi bi-box-seam me-2"></i> Inventory
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'orders' ? 'active shadow-sm' : 'bg-white text-dark border'}`} onClick={() => setActiveTab('orders')}>
            <i className="bi bi-cart me-2"></i> Orders
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'customers' ? 'active shadow-sm' : 'bg-white text-dark border'}`} onClick={() => setActiveTab('customers')}>
            <i className="bi bi-people me-2"></i> Customers
          </button>
        </li>
      </ul>

      {/* Content based on Active Tab */}
      {data.summary && (
        <div className="dashboard-content animate__animated animate__fadeIn">
          {/* SALES TAB */}
          {activeTab === 'sales' && (
            <>
              <LiveSalesWidgets revenueData={data.revenue} />
              <div className="row g-4 mb-4">
                <div className="col-lg-8">
                  <div className="card shadow-sm border-0 rounded-3 h-100">
                    <div className="card-header bg-white border-bottom border-light py-3">
                      <h6 className="mb-0 fw-bold">Revenue Trend (Last 6 Months)</h6>
                    </div>
                    <div className="card-body" style={{ height: '350px' }}>
                      {data.analytics?.monthlyRevenue && <RevenueTrendChart data={data.analytics.monthlyRevenue} />}
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="card shadow-sm border-0 rounded-3 h-100">
                    <div className="card-header bg-white border-bottom border-light py-3">
                      <h6 className="mb-0 fw-bold">Live Activity Feed</h6>
                    </div>
                    <div className="card-body p-3 overflow-auto" style={{ maxHeight: '350px' }}>
                      <ActivityFeed activities={data.activity} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <>
              <LiveInventoryWidgets inventoryData={data.inventory} />
              <div className="row g-4 mb-4">
                <div className="col-lg-4">
                  <div className="card shadow-sm border-0 rounded-3 h-100">
                    <div className="card-header bg-white border-bottom border-light py-3">
                      <h6 className="mb-0 fw-bold">Inventory Health</h6>
                    </div>
                    <div className="card-body" style={{ height: '300px' }}>
                      {data.inventory && (
                        <InventoryDoughnutChart 
                          total={data.inventory.totalInventory} 
                          lowStock={data.inventory.lowStock?.length} 
                          outOfStock={data.inventory.outOfStock?.length} 
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-lg-8">
                  <div className="card shadow-sm border-0 rounded-3 h-100">
                    <div className="card-header bg-white border-bottom border-light py-3">
                      <h6 className="mb-0 fw-bold">Top Selling Products</h6>
                    </div>
                    <div className="card-body" style={{ height: '300px' }}>
                      {data.products?.bestSelling && <TopSellingProductsChart data={data.products.bestSelling} />}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <>
              <LiveOrderWidgets ordersData={data.orders} />
              <div className="row g-4 mb-4">
                <div className="col-lg-6">
                  <div className="card shadow-sm border-0 rounded-3 h-100">
                    <div className="card-header bg-white border-bottom border-light py-3">
                      <h6 className="mb-0 fw-bold">Order Status Breakdown</h6>
                    </div>
                    <div className="card-body" style={{ height: '300px' }}>
                      {data.analytics?.orderStatus && <OrdersStatusChart data={data.analytics.orderStatus} />}
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="card shadow-sm border-0 rounded-3 h-100">
                    <div className="card-header bg-white border-bottom border-light py-3 d-flex justify-content-between align-items-center">
                      <h6 className="mb-0 fw-bold">Recent Order Activity</h6>
                    </div>
                    <div className="card-body p-3 overflow-auto" style={{ maxHeight: '300px' }}>
                      {/* Filter activity feed for orders only */}
                      <ActivityFeed activities={data.activity?.filter(a => a.type === 'order')} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <>
              <LiveCustomerWidgets customersData={data.customers} />
              <div className="row g-4 mb-4">
                <div className="col-lg-12">
                  <div className="card shadow-sm border-0 rounded-3 h-100">
                    <div className="card-header bg-white border-bottom border-light py-3">
                      <h6 className="mb-0 fw-bold">Recent Registrations</h6>
                    </div>
                    <div className="card-body p-0">
                      <ul className="list-group list-group-flush">
                        {data.customers?.recentRegistrations?.map(user => (
                          <li key={user._id} className="list-group-item px-4 py-3 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              <img src={user.avatar || 'https://via.placeholder.com/40'} alt={user.name} className="rounded-circle me-3" width="40" height="40" />
                              <div>
                                <h6 className="mb-0">{user.name}</h6>
                                <small className="text-muted">{user.email}</small>
                              </div>
                            </div>
                            <small className="text-muted">{new Date(user.createdAt).toLocaleDateString()}</small>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
