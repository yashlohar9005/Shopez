import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import orderService from '../services/orderService';
import OrderCard from '../components/OrderCard';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const pageNumber = searchParams.get('page') || 1;

  // Optional success message from checkout
  const message = location.state?.message;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getUserOrders({ page: pageNumber });
        setOrders(data.orders || []);
        setPagination(data.pagination || {});
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    window.scrollTo(0, 0);
  }, [pageNumber]);

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">My Orders</h2>

      {message && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {message}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-5 bg-white rounded shadow-sm">
          <i className="bi bi-box-seam fs-1 text-muted mb-3 d-block"></i>
          <h4 className="text-muted mb-4">You have no orders yet</h4>
          <Link to="/products" className="btn btn-primary px-4 rounded-pill">
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col-lg-10 mx-auto">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          </div>
          
          <Pagination 
            pages={pagination.pages} 
            page={pagination.page} 
          />
        </>
      )}
    </div>
  );
};

export default Orders;
