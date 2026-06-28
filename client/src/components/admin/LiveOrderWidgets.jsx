import React from 'react';

const LiveOrderWidgets = ({ ordersData }) => {
  if (!ordersData) return null;

  return (
    <div className="row g-3 mb-4">
      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0 h-100 bg-white">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-2">Orders Today</h6>
              <h3 className="mb-0 fw-bold">{ordersData.ordersToday}</h3>
            </div>
            <div className="fs-1 text-primary opacity-25"><i className="bi bi-cart"></i></div>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0 h-100 bg-white">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-2">Pending</h6>
              <h3 className="mb-0 fw-bold text-warning">{ordersData.status?.pending || 0}</h3>
            </div>
            <div className="fs-1 text-warning opacity-25"><i className="bi bi-hourglass-split"></i></div>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0 h-100 bg-white">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-2">Processing</h6>
              <h3 className="mb-0 fw-bold text-info">{ordersData.status?.processing || 0}</h3>
            </div>
            <div className="fs-1 text-info opacity-25"><i className="bi bi-box-seam"></i></div>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="card shadow-sm border-0 h-100 bg-white">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-2">Delivered</h6>
              <h3 className="mb-0 fw-bold text-success">{ordersData.status?.delivered || 0}</h3>
            </div>
            <div className="fs-1 text-success opacity-25"><i className="bi bi-check-circle"></i></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveOrderWidgets;
