import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import paymentService from '../../services/paymentService';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await paymentService.getTransactions();
        setTransactions(Array.isArray(data) ? data : data?.data || []);
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const formatPrice = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : '—';

  const getStatusBadge = (status) => {
    const map = {
      'success': 'bg-success',
      'pending': 'bg-warning text-dark',
      'failed': 'bg-danger',
      'refunded': 'bg-info'
    };
    return <span className={`badge ${map[status] || 'bg-secondary'}`}>{status}</span>;
  };

  return (
    <div className="container-fluid py-4">
      <h2 className="fw-bold mb-4">Transaction History</h2>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-5 bg-white rounded shadow-sm">
          <i className="bi bi-wallet2 fs-1 text-muted mb-3 d-block"></i>
          <h4 className="text-muted mb-4">No transactions found</h4>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th>Order Ref</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => (
                  <tr key={txn._id}>
                    <td className="fw-bold text-muted small">{txn.transactionId}</td>
                    <td>{formatDate(txn.createdAt)}</td>
                    <td>
                      {txn.order ? (
                        <Link to={`/orders/${txn.order._id}`} className="text-decoration-none">
                          #{txn.order._id.slice(-6).toUpperCase()}
                        </Link>
                      ) : 'N/A'}
                    </td>
                    <td>{txn.paymentMethod}</td>
                    <td className="fw-bold">{formatPrice(txn.amount)}</td>
                    <td>{getStatusBadge(txn.paymentStatus)}</td>
                    <td>
                      {txn.invoiceId ? (
                        <Link to={`/invoice/${txn.order?._id}`} className="btn btn-sm btn-outline-primary rounded-circle" title="View Invoice" target="_blank">
                          <i className="bi bi-receipt"></i>
                        </Link>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
