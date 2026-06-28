import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import OrderTable from '../../components/admin/OrderTable';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const searchParams = new URLSearchParams(window.location.search);
  const pageNumber = searchParams.get('page') || 1;
  const urlStatus = searchParams.get('status');

  useEffect(() => {
    if (urlStatus && !statusFilter) {
      setStatusFilter(urlStatus);
    }
  }, [urlStatus]);

  useEffect(() => {
    fetchOrders();
  }, [pageNumber, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page: pageNumber, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;

      const data = await adminService.getAllOrders(params);
      setOrders(data.orders || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await adminService.updateOrderStatus(id, status);
      fetchOrders(); // Refresh to ensure backend validation applied
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleCancel = async (id) => {
    try {
      await adminService.cancelOrder(id);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="pb-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold m-0 text-dark">Manage Orders</h2>
          <p className="text-muted mb-0 small">Process and track customer orders</p>
        </div>
        
        {/* Filters and Search */}
        <div className="d-flex flex-column flex-md-row gap-2">
          <select 
            className="form-select border-0 shadow-sm text-muted" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <form onSubmit={handleSearch} className="d-flex">
            <div className="input-group shadow-sm rounded-3 overflow-hidden">
              <input 
                type="text" 
                className="form-control border-0" 
                placeholder="Search by ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary border-0 px-3" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}

      {loading ? (
        <Loader />
      ) : (
        <>
          <OrderTable 
            orders={orders} 
            onStatusUpdate={handleStatusUpdate} 
            onCancel={handleCancel}
          />
          
          <div className="mt-4 d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              Showing <span className="fw-bold text-dark">{orders.length}</span> of <span className="fw-bold text-dark">{pagination.total}</span> orders
            </div>
            <Pagination pages={pagination.pages} page={pagination.page} isAdmin={true} />
          </div>
        </>
      )}
    </div>
  );
};

export default ManageOrders;
