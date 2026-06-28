import React from 'react';

const TransactionTable = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <i className="bi bi-credit-card text-muted opacity-50 mb-3 d-block" style={{ fontSize: '3rem' }}></i>
          <h5 className="text-muted">No transactions found.</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="table-responsive bg-white rounded-3 shadow-sm border-0">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col" className="ps-4 py-3">Transaction ID</th>
            <th scope="col" className="py-3">Date</th>
            <th scope="col" className="py-3">Customer</th>
            <th scope="col" className="py-3">Amount</th>
            <th scope="col" className="py-3">Method</th>
            <th scope="col" className="text-end pe-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx._id}>
              <td className="ps-4 py-3">
                <div className="fw-bold text-dark font-monospace mb-1">
                  {tx.razorpayPaymentId || `ORDER-${tx._id.substring(10).toUpperCase()}`}
                </div>
                <div className="text-muted small">Order: #{tx._id.substring(18)}</div>
              </td>
              <td className="py-3 text-muted">
                {new Date(tx.createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </td>
              <td className="py-3">
                <div className="fw-medium text-dark">{tx.user?.name || 'Guest User'}</div>
                <div className="text-muted small">{tx.user?.email || 'N/A'}</div>
              </td>
              <td className="py-3 fw-bold">
                ₹{tx.totalPrice.toLocaleString('en-IN')}
              </td>
              <td className="py-3">
                <span className="badge bg-light text-dark border">
                  {tx.paymentMethod?.toUpperCase()}
                </span>
              </td>
              <td className="text-end pe-4 py-3">
                {tx.paymentStatus === 'paid' ? (
                  <span className="badge rounded-pill bg-success"><i className="bi bi-check-circle-fill me-1"></i> Success</span>
                ) : tx.paymentStatus === 'failed' ? (
                  <span className="badge rounded-pill bg-danger"><i className="bi bi-x-circle-fill me-1"></i> Failed</span>
                ) : tx.paymentStatus === 'refunded' ? (
                  <span className="badge rounded-pill bg-info text-dark"><i className="bi bi-arrow-return-left me-1"></i> Refunded</span>
                ) : (
                  <span className="badge rounded-pill bg-warning text-dark"><i className="bi bi-hourglass-split me-1"></i> Pending</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
