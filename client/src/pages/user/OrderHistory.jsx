import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import customerApiService from "../../services/customerApiService";
import OrderCard from "../../components/OrderCard";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const pageNumber = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page: pageNumber,
        };

        if (statusFilter) {
          params.status = statusFilter;
        }

        const response = await customerApiService.getOrders(params);

        console.log("Orders API Response:", response);

        // Support multiple backend response formats
        if (response?.orders) {
          setOrders(response.orders);
        } else if (response?.data?.orders) {
          setOrders(response.data.orders);
        } else if (Array.isArray(response)) {
          setOrders(response);
        } else {
          setOrders([]);
        }

        if (response?.pagination) {
          setPagination(response.pagination);
        } else if (response?.data?.pagination) {
          setPagination(response.data.pagination);
        } else {
          setPagination({
            page: 1,
            pages: 1,
            total: 0,
            limit: 10,
          });
        }
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load orders."
        );

        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    window.scrollTo(0, 0);
  }, [pageNumber, statusFilter]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Order History</h3>

        <select
          className="form-select form-select-sm w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Orders</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-5 bg-white rounded shadow-sm">
          <i className="bi bi-box-seam fs-1 text-muted mb-3"></i>

          <h4>No Orders Found</h4>

          <Link
            to="/products"
            className="btn btn-primary rounded-pill mt-3"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="d-flex flex-column gap-3">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>

          {pagination &&
            pagination.pages &&
            pagination.pages > 1 && (
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
              />
            )}
        </>
      )}
    </>
  );
};

export default OrderHistory;